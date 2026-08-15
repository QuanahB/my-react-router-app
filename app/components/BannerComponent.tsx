import type { HTMLAttributes,ReactNode } from "react";
export type BannerAlternate = "main" | "alternate";
import { SelectorComponent } from "./SelectorComponent";

export type BannerProps = {
    className?: string;
    alternate?: BannerAlternate;
}& Omit<HTMLAttributes<HTMLDivElement>,"className">;

const alternateClasses: Record<BannerAlternate, string> = {
  main:["bg-stone-900 text-stone-50"].join(" "),
  alternate:["bg-transparent text-stone-900"].join(" ")
};

export function BannerComponent({
    className = "",
    alternate = "main",
    ...rest
}: BannerProps){
    return(
        <div
            className={[
            "flex w-full items-center justify-evenly",
            alternateClasses[alternate],
            className,
        ]
            .filter(Boolean)
            .join(" ")}
        {...rest}
        >
            <SelectorComponent>Home</SelectorComponent>
            <SelectorComponent>Shop</SelectorComponent>
            <SelectorComponent>Cart</SelectorComponent>
            <SelectorComponent>Account</SelectorComponent>
        </div>
    );
}