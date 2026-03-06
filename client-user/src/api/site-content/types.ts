export interface BannerSlide {
  image: string;
  imageMobile?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonPosition?: string;
  buttonBg?: string;
  buttonColor?: string;
}

export interface BannerContent {
  slides: BannerSlide[];
}
