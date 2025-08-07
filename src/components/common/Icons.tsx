import Image from "next/image";

export const Icons = {
    logo: (props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) => (
        <Image
            src="https://img77.uenicdn.com/image/upload/v1561895850/business/phoenix-science-academy-malkapur/d300ef86-3f4e-4b84-b10c-b8cd743b0696.jpg"
            alt="Phoenix Science Academy Logo"
            width={props.width ? Number(props.width) : 50}
            height={props.height ? Number(props.height) : 50}
            className="rounded-full"
            {...props}
        />
    ),
};
