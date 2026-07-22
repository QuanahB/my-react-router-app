import LogoImage from "~/assets/birdLogo.avif"
import type { ImgHTMLAttributes,ReactNode } from "react"

export type LogoProps = {
    title?: string;
    className?: string;

} & Omit<ImgHTMLAttributes<HTMLImageElement>,"className">;

export function Logo({})