/*
setTimeout(() => {
scrollSection.classList.add("shake");
setTimeout(() => {
scrollSection.classList.remove("shake");
}, 500);
}, 1500);*/
const scrollSection: HTMLElement | null =
    document.querySelector(".scroll-section");
const anchors: NodeListOf<HTMLElement> =
    document.querySelectorAll(".scrolling-anchor");
if (scrollSection !== null) {
    function isScrollableSection(scrollDelta: number) {
        const currentAnchor = Array.from(anchors).find(
            (anchor) =>
                scrollSection!.scrollTop + scrollSection!.clientHeight >
                    anchor.offsetTop &&
                scrollSection!.scrollTop + scrollSection!.clientHeight <=
                    anchor.offsetTop + anchor.offsetHeight
        );

        if (!currentAnchor) {
            return -2; // not in an anchor
        }
        const topOverflow = scrollSection!.scrollTop - currentAnchor.offsetTop;

        const bottomOverflow =
            currentAnchor.scrollHeight -
            (scrollSection!.scrollTop - currentAnchor.offsetTop) -
            scrollSection!.clientHeight;
        if (scrollDelta > 0 && bottomOverflow <= 5) {
            return -1;
        }
        if (scrollDelta < 0 && topOverflow <= 5) {
            return -1;
        }

        if (scrollDelta > 0 && bottomOverflow > 5) {
            return -Math.min(0, bottomOverflow - scrollDelta);
        }

        if (scrollDelta < 0 && topOverflow > 5) {
            return -Math.min(0, topOverflow - Math.abs(scrollDelta));
        }

        return 0; // no overshoot
    }
    if (scrollSection !== null && anchors !== undefined && anchors.length > 0) {
        let handlingScroll = false;

        function normalizeDelta(delta: number) {
            return Math.sign(delta);
        }

        function getClosestAnchorDirection() {
            const scrollOffset = scrollSection!.scrollTop;
            const windowHeight = scrollSection!.clientHeight;

            let nextAnchorDistance = null;
            let anchorOffset = null;
            let anchorBottomOffset = null;
            let signOfAnchor = null;
            let anchor = null;
            for (let i = 0; i < anchors.length; i++) {
                anchor = anchors[i];
                anchorOffset = anchor.offsetTop;
                anchorBottomOffset = anchor.offsetTop + anchor.clientHeight;

                if (
                    anchorBottomOffset > scrollOffset + windowHeight &&
                    scrollOffset > anchorOffset
                ) {
                    if (anchorBottomOffset - windowHeight * 2 < scrollOffset) {
                        signOfAnchor = 0; // Had to be 1 to get down, however contradicts the scroll functions behivour
                    } else if (scrollOffset < anchorOffset + windowHeight * 2) {
                        signOfAnchor = -1;
                    } else {
                        signOfAnchor = 0;
                    }
                    break;
                } else {
                    let distanceToAnchor = Math.abs(
                        anchorOffset - scrollOffset
                    );
                    if (nextAnchorDistance == null) {
                        nextAnchorDistance = distanceToAnchor;
                        signOfAnchor = normalizeDelta(
                            anchorOffset - scrollOffset
                        );
                    } else if (distanceToAnchor < nextAnchorDistance) {
                        nextAnchorDistance = distanceToAnchor;
                        signOfAnchor = normalizeDelta(
                            anchorOffset - scrollOffset
                        );
                    }
                }
            }
            return signOfAnchor;
        }

        function getAnchorInDirection(delta: number) {
            const scrollOffset = scrollSection!.scrollTop;
            const windowHeight = scrollSection!.clientHeight;

            let nextAnchor: HTMLElement | null = null;
            let nextAnchorOffset: number | null = null;
            let anchorOffset = null;

            if (delta != 0) {
                anchors.forEach((anchor) => {
                    anchorOffset = anchor.offsetTop;
                    if (
                        (delta > 0 && anchorOffset > scrollOffset + 5) ||
                        (delta < 0 && anchorOffset < scrollOffset - 5)
                    ) {
                        if (
                            nextAnchor === null ||
                            Math.abs(anchorOffset - scrollOffset) <
                                Math.abs(nextAnchorOffset! - scrollOffset)
                        ) {
                            nextAnchor = anchor;
                            nextAnchorOffset = anchorOffset;
                        }
                    }
                });
            }

            if (nextAnchor === null) {
                return false;
            }

            if (delta < 0) {
                if (
                    !(
                        scrollSection!.scrollTop <=
                        nextAnchorOffset! +
                            (nextAnchor as HTMLElement).clientHeight -
                            scrollSection!.clientHeight
                    )
                ) {
                    nextAnchorOffset = Math.max(
                        0,
                        nextAnchorOffset! +
                            (nextAnchor as HTMLElement).clientHeight -
                            scrollSection!.clientHeight
                    );
                }
            }

            return nextAnchorOffset;
        }

        function scrollToAnchor(offset: number) {
            scrollSection!.scrollTo(0, offset);
        }
        let isScrollSection: number;
        function onMouseWheel(event: WheelEvent) {
            const deltaY = normalizeDelta(event.deltaY);
            if (!handlingScroll) {
                isScrollSection = isScrollableSection(event.deltaY);
            }

            event.preventDefault();

            if (
                !scrolling &&
                !handlingScroll &&
                isScrollSection >= 0 &&
                getAnchorInDirection(deltaY) != null &&
                deltaY != 0
            ) {
                handlingScroll = true;

                scrollSection!.scrollTop +=
                    deltaY *
                    (Math.abs(event.deltaY) - Math.abs(isScrollSection));
                return;
            }

            if (!scrolling == true && !handlingScroll == true) {
                handlingScroll = true;

                const nextAnchorOffset = getAnchorInDirection(deltaY);
                if (nextAnchorOffset !== false) {
                    scrollSection!.scrollTop += deltaY;
                } else {
                    handlingScroll = false;
                }
            }
        }

        scrollSection.addEventListener("wheel", onMouseWheel, {
            passive: false,
        });

        // Handle keydown events
        const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40, 107, 109];

        function onKeyDown(event: KeyboardEvent) {
            const deltaY =
                event.keyCode === 38 ||
                event.keyCode === 107 ||
                event.keyCode === 36
                    ? -100
                    : 100;
            if (!handlingScroll) {
                isScrollSection = isScrollableSection(deltaY);
            }

            const normalizedDelta = normalizeDelta(deltaY);
            event.preventDefault();
            if (
                !scrolling &&
                !handlingScroll &&
                isScrollSection >= 0 &&
                getAnchorInDirection(deltaY) != null
            ) {
                handlingScroll = true;

                scrollSection!.scrollTop +=
                    normalizedDelta *
                    (Math.abs(deltaY) - Math.abs(isScrollSection));
                return;
            }

            if (!scrolling == true && !handlingScroll == true) {
                if (scrollKeys.includes(event.keyCode)) {
                    handlingScroll = true;

                    const nextAnchorOffset =
                        getAnchorInDirection(normalizedDelta);

                    if (nextAnchorOffset !== false) {
                        scrollSection!.scrollTop += normalizedDelta;
                    } else {
                        handlingScroll = false;
                    }
                }
            }
        }

        scrollSection.addEventListener("keydown", onKeyDown);
        scrollSection.tabIndex = 0;
        scrollSection.focus();

        let startY: number;

        function onTouchStart(event: TouchEvent) {
            if (!scrolling == true && !handlingScroll == true) {
                if (event.touches.length === 1) {
                    startY = event.touches[0].pageY;
                }
            }
        }

        function onTouchMove(event: TouchEvent) {
            const deltaY = startY - event.touches[0].pageY;
            const normalizedDelta = normalizeDelta(deltaY);
            if (!handlingScroll) {
                isScrollSection = isScrollableSection(deltaY);
            }

            if (
                !scrolling &&
                !handlingScroll &&
                isScrollSection >= 0 &&
                getAnchorInDirection(deltaY) != null &&
                deltaY != 0
            ) {
                handlingScroll = true;
                scrollSection!.scrollTop +=
                    normalizedDelta *
                    (Math.abs(deltaY) - Math.abs(isScrollSection));
                return;
            }
            event.preventDefault();

            if (!scrolling == true && !handlingScroll == true) {
                if (event.touches.length === 1) {
                    handlingScroll = true;

                    const nextAnchorOffset =
                        getAnchorInDirection(normalizedDelta);
                    if (nextAnchorOffset !== false) {
                        scrollSection!.scrollTop += normalizedDelta;
                    } else {
                        handlingScroll = false;
                    }
                }
            }
        }

        scrollSection.addEventListener("touchstart", onTouchStart, {
            passive: false,
        });
        scrollSection.addEventListener("touchmove", onTouchMove, {
            passive: false,
        });

        function onGamepadConnected(event: GamepadEvent) {
            const gamepad = event.gamepad;
            gamepadLoop(gamepad);
        }
        let holdingScrollBar = false;
        function gamepadLoop(gamepad: Gamepad) {
            const axes = gamepad.axes;
            const deltaY = axes[1];
            const normalizedDelta = normalizeDelta(deltaY);
            if (!handlingScroll) {
                isScrollSection = isScrollableSection(deltaY);
            }
            if (!scrolling && !handlingScroll && isScrollSection >= 0) {
                handlingScroll = true;
                scrollSection!.scrollTop +=
                    normalizedDelta *
                    (Math.abs(deltaY) - Math.abs(isScrollSection));
                return;
            }
            if (!scrolling == true) {
                if (Math.abs(deltaY) > 0.5) {
                    const nextAnchorOffset =
                        getAnchorInDirection(normalizedDelta);
                    if (nextAnchorOffset !== false) {
                        scrollSection!.scrollTop += normalizedDelta;
                    } else {
                        handlingScroll = false;
                    }
                }
                requestAnimationFrame(() => gamepadLoop(gamepad));
            }
        }

        function clickedOnScrollBar(mouseX: number) {
            if (scrollSection!.clientWidth - 10 <= mouseX) {
                return true;
            }
            return false;
        }

        scrollSection.addEventListener("mousedown", (e) => {
            if (clickedOnScrollBar(e.clientX)) {
                holdingScrollBar = true;
                cancelScroll = true;
            }
        });

        scrollSection.addEventListener("mouseup", (e) => {
            if (holdingScrollBar) {
                scrolling = false;
                handlingScroll = false;
                oldScroll = scrollSection.scrollTop;
                cancelScroll = false;
                isScrollSection = -1;
                const normalizedDelta = getClosestAnchorDirection();

                if (normalizedDelta !== null && normalizedDelta !== 0) {
                    scrollSection.scrollTop += normalizedDelta;
                }

                holdingScrollBar = false;
            }
        });

        window.addEventListener("gamepadconnected", onGamepadConnected);

        let lastDirection = 0;
        let scrolling = false;
        let cancelScroll = false;

        let oldScroll = scrollSection.scrollTop;
        scrollSection.addEventListener("scroll", (event) => {
            event.preventDefault();
            if (isScrollSection >= 0) {
                scrolling = false;
                handlingScroll = false;
                oldScroll = scrollSection.scrollTop;
                cancelScroll = false;
                return;
            }

            if (scrolling) {
                const delta = oldScroll >= scrollSection.scrollTop ? -1 : 1;
                if (lastDirection !== 0 && lastDirection !== delta) {
                    cancelScroll = true;
                }
                return;
            } else {
                const animF = (now: DOMHighResTimeStamp) => {
                    const delta = oldScroll > scrollSection.scrollTop ? -1 : 1;

                    lastDirection = delta;

                    const nextAnchorOffset = getAnchorInDirection(delta);

                    if (
                        nextAnchorOffset !== null &&
                        nextAnchorOffset !== false
                    ) {
                        const scrollOffset = scrollSection.scrollTop;
                        const windowHeight = scrollSection.clientHeight;

                        const distanceToAnchor = Math.abs(
                            nextAnchorOffset - scrollOffset
                        );

                        const scrollLockDistance = 10; // vh
                        const scrollLockPixels =
                            (windowHeight * scrollLockDistance) / 100;

                        if (distanceToAnchor <= scrollLockPixels) {
                            scrolling = true;

                            scrollLastBit(
                                nextAnchorOffset,
                                distanceToAnchor,
                                true,
                                delta
                            );
                        } else {
                            const freeScrollValue =
                                distanceToAnchor - scrollLockPixels;
                            const newScrollOffset =
                                scrollOffset + delta * freeScrollValue;
                            scrolling = true;

                            scrollCloseToAnchor(
                                newScrollOffset,
                                freeScrollValue,
                                false,
                                () => {
                                    scrollLastBit(
                                        nextAnchorOffset,
                                        scrollLockPixels,
                                        true,
                                        delta
                                    );
                                }
                            );
                        }
                    } else {
                        scrolling = false;
                        handlingScroll = false;
                        oldScroll = scrollSection.scrollTop;
                        cancelScroll = false;
                    }
                };
                requestAnimationFrame(animF);
            }
        });

        function scrollLastBit(
            offset: number,
            distance: number,
            braking: boolean,
            direction: number
        ) {
            offset = Math.round(offset);
            distance = Math.round(distance);
            const start = scrollSection!.scrollTop;
            const startTime = performance.now();

            const scrollDuration = braking ? distance * 10 : distance * 1;
            let endTick = false;

            if (
                offset >= scrollSection!.scrollTop - 5 &&
                offset <= scrollSection!.scrollTop + 5
            ) {
                scrolling = false;
                handlingScroll = false;
                oldScroll = scrollSection!.scrollTop;
                cancelScroll = false;

                return;
            }
            let difference = Math.abs(scrollSection!.scrollTop - offset);
            const tick = (now: DOMHighResTimeStamp) => {
                if (cancelScroll) {
                    lastDirection = 0;
                    cancelScroll = false;
                } else {
                    if (
                        Math.abs(scrollSection!.scrollTop - offset) > difference
                    ) {
                        difference = Math.abs(
                            scrollSection!.scrollTop - offset
                        );
                        requestAnimationFrame(tick);
                    } else {
                        difference = Math.abs(
                            scrollSection!.scrollTop - offset
                        );
                        if (endTick) {
                            if (direction < 0) {
                                if (offset >= scrollSection!.scrollTop - 10) {
                                    scrolling = false;
                                    handlingScroll = false;
                                    cancelScroll = false;
                                    oldScroll = scrollSection!.scrollTop;
                                    scrollSection!.scrollTop = offset;
                                } else {
                                    requestAnimationFrame(tick);
                                }
                            } else {
                                if (offset <= scrollSection!.scrollTop + 10) {
                                    scrolling = false;
                                    handlingScroll = false;
                                    oldScroll = scrollSection!.scrollTop;
                                } else {
                                    requestAnimationFrame(tick);
                                }
                            }
                        } else {
                            const elapsed = now - startTime;
                            const fraction = elapsed / scrollDuration;

                            if (fraction < 1) {
                                const easeOut = braking
                                    ? -Math.pow(2, -10 * fraction) + 1
                                    : fraction;
                                scrollToAnchor(
                                    start + (offset - start) * easeOut
                                );

                                requestAnimationFrame(tick);
                            } else {
                                scrollToAnchor(offset);
                                endTick = true;
                                requestAnimationFrame(tick);
                            }
                        }
                    }
                }
            };

            requestAnimationFrame(tick);
        }

        function scrollCloseToAnchor(
            offset: number,
            distance: number,
            braking: boolean,
            callback: ((...args: any[]) => void) | null = null
        ) {
            if (offset == scrollSection!.scrollTop) {
                scrolling = false;
                handlingScroll = false;
                oldScroll = scrollSection!.scrollTop;
                cancelScroll = false;

                return;
            }

            offset = Math.round(offset);
            distance = Math.round(distance);
            const start = scrollSection!.scrollTop;
            const startTime = performance.now();

            const scrollDuration = braking ? distance * 10 : distance * 1;
            let difference = Math.abs(scrollSection!.scrollTop - offset);
            const tick = (now: DOMHighResTimeStamp) => {
                if (cancelScroll) {
                    lastDirection = 0;
                    cancelScroll = false;
                } else {
                    if (
                        Math.abs(scrollSection!.scrollTop - offset) > difference
                    ) {
                        difference = Math.abs(
                            scrollSection!.scrollTop - offset
                        );
                        requestAnimationFrame(tick);
                    } else {
                        difference = Math.abs(
                            scrollSection!.scrollTop - offset
                        );

                        const elapsed = now - startTime;
                        const fraction = elapsed / scrollDuration;

                        if (fraction < 1) {
                            const easeOut = braking
                                ? -Math.pow(2, -10 * fraction) + 1
                                : fraction;

                            scrollToAnchor(start + (offset - start) * easeOut);

                            requestAnimationFrame(tick);
                        } else {
                            if (callback !== null) callback();
                            scrollToAnchor(offset);
                        }
                    }
                }
            };
            requestAnimationFrame(tick);
        }
    }
}
