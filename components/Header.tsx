export default function Header({ title }: { title: string }) {
  return (
    <div className="flex-auto">
      <h1 className="title">{title}</h1>
    </div>
  );
}
