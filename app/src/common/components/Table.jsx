export function Table({ columns, rows, caption }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        {caption ? <caption className="border-b border-slate-800 bg-slate-900 px-4 py-3 text-left text-slate-300">{caption}</caption> : null}
        <thead className="bg-slate-900">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="border-b border-slate-800 px-4 py-3 font-semibold text-slate-300">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.title || i}`} className={i % 2 === 0 ? "bg-slate-950" : "bg-slate-900/70"}>
              {columns.map((col) => (
                <td key={col.key} className="border-b border-slate-800 px-4 py-3 text-slate-100">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
