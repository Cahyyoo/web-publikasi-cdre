import { photoHintClass } from "./formStyles";

export default function PhotoRequirements({ items }: { items: string[] }) {
  return (
    <ul className={photoHintClass}>
      {items.map((item) => (
        <li key={item}>&bull; {item}</li>
      ))}
    </ul>
  );
}
