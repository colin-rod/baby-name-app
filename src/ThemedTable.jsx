export default function ThemedTable({ headers, rows, renderRow }) {
  return (
    <table className="min-w-full border border-primary bg-white rounded shadow">
      <thead className="bg-secondary text-white">
        <tr>
          {headers.map((header, i) => (
            <th key={i} className="px-4 py-2 border border-primary text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows.map(renderRow)}</tbody>
    </table>
  );
}