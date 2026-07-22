/**
 * MDX içinde vurgulu sayı kutusu:
 *   <KeyStat value="%20" label="Gelirin birikime ayrılan payı" note="50/30/20 kuralı" />
 */
export default function KeyStat({ value, label, note }) {
  return (
    <div className="my-6 rounded-brand border border-line bg-subtle/60 p-5 text-center">
      <span className="block font-mono text-4xl font-bold tracking-tight text-primary-600">
        {value}
      </span>
      <span className="mt-1 block text-sm font-semibold text-ink">{label}</span>
      {note ? <span className="mt-1 block text-xs text-muted">{note}</span> : null}
    </div>
  );
}
