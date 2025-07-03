import { theme } from '../theme'

export default function ThemedTable({ headers, rows, renderRow }) {
  return (
    <table
      className="w-full border rounded"
      style={{ borderColor: theme.primary }}
    >
      <thead style={{ backgroundColor: theme.secondary, color: theme.textOnSecondary }}>
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-3 py-2 text-left border"
              style={{ borderColor: theme.primary }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows.map(renderRow)}</tbody>
    </table>
  )
}