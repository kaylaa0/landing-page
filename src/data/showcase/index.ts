import type { ShowcaseSite } from "~/types";
import sitesData from "./sites.json";

const allImages = import.meta.glob<ImageMetadata>("./images/*.{png,jpg,jpeg}", {
    eager: true,
    import: "default",
});

let _loadShowcase: Promise<Array<ShowcaseSite>>;

async function loadShowcase(): Promise<Array<ShowcaseSite>> {
    const sites = await Promise.all(
        sitesData.map(async (site) => {
            if (!(site.image in allImages)) {
                console.error(
                    `Image for "${site.title}" not found (provided: "${site.image}")`
                );
            }

            const image = await allImages[site.image];

            return {
                ...site,
                image,
            };
        })
    );

    return sites;
}

export async function getShowcase() {
    _loadShowcase = _loadShowcase || loadShowcase();
    return _loadShowcase;
}
