import { Peachy } from "@peach/component";
import placeholder from "@assets/thumbnail_placeholder.png";

export default function Image({ src, alt, className, ...props }) {
  return (
    <img
      src={src}
      onError={(e) => {
        e.target.onerror = null; // prevents looping
        e.target.src = placeholder;
      }}
      alt={alt}
      className={`${className}`}
      {...props}
    />
  );
}
