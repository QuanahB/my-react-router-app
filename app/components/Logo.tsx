import LogoImage from "~/assets/birdLogo.avif"
import type { ImgHTMLAttributes,ReactNode } from "react"
export type LogoAlternate = "main" | "alternate"

export type LogoProps = {
    title?: string;
    className?: string;
    alternate?: LogoAlternate;
    src?: string;

} & Omit<ImgHTMLAttributes<HTMLImageElement>,"className">;

//Need to pass the image into the class and then work on variatons.
const alternateClasses: Record<LogoAlternate, string> = {
  main:["bg-stone-900 text-stone-50"].join(" "),
  alternate:["bg-transparent text-stone-900"].join(" ")
};

export function Logo({
    title = "Website Logo",
    className = "",
    alternate = "main",
    src = LogoImage,//"~/assets/birdLogo.avif"
    ...rest
}: LogoProps){
    return(
        <img
        className={[
            className,
            src,
            alternateClasses[alternate]
        ]
            .filter(Boolean)
            .join(" ")}
        {...rest}
        >
        </img>
    );
}