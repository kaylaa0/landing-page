export interface IconItem {
    icon: string;
    title: string;
    url: string;
}

export interface FeatureItem {
    description: string;
    icon: string;
    title: string;
}

export interface FooterLink {
    description: string;
    icon: string;
    url: string;
}

export interface NavItem {
    title: string;
    url: string;
    isExternal: boolean;
    hasDropDown: boolean;
    subMenuItems: NavItem[];
}

export interface ShowcaseSite {
    title: string;
    image: ImageMetadata;
    url: string;
}
