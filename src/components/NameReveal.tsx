const name = "Omprakash Sahani";

export function NameReveal() {
  return <h1 className="revealed-name" aria-label={name}><span aria-hidden="true">{name}</span></h1>;
}
