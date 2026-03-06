export interface BannerSlide {
  image: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface BannerContent {
  slides: BannerSlide[];
}
