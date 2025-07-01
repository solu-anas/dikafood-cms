# UniversalPage Component

The `UniversalPage` component provides a standardized layout structure for all list pages in the DikaFood CMS. It abstracts the common pattern of:
- Page title
- Status filter bar with counts
- Main action button (Create/Add)
- Custom table with consistent styling

## Structure

```
┌─────────────────────────────────────────────────────────┐
│  Page Title                                             │
├─────────────────────────────────────────────────────────┤
│  [Status Filter 1] [Status Filter 2] ... [Create Btn]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    Table Content                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Usage

### Basic Example

```tsx
import UniversalPage, { StatusFilter } from "../../components/layout/UniversalPage";

const statusFilters: StatusFilter[] = [
  {
    key: "all",
    label: "All",
    icon: <AppstoreOutlined />,
    color: "#1890ff",
    bgColor: "rgba(24, 144, 255, 0.15)",
    borderColor: "rgba(24, 144, 255, 0.3)",
    count: tableProps.dataSource?.length || 0
  },
  // ... more filters
];

return (
  <UniversalPage
    title="Your Page Title"
    statusFilters={statusFilters}
    activeStatusFilter={activeStatusFilter}
    onStatusFilterChange={handleStatusFilterChange}
    tableProps={tableProps}
    tableClassName="your-table-class"
    entityName="your-entities"
  >
    <Table.Column title="Column 1" dataIndex="field1" />
    <Table.Column title="Column 2" dataIndex="field2" />
    {/* More columns */}
  </UniversalPage>
);
```

### Advanced Example with Custom Actions

```tsx
const customActions: ActionButton[] = [
  {
    key: "export",
    label: "Export",
    icon: <ExportOutlined />,
    onClick: handleExport,
    type: "default"
  },
  {
    key: "import",
    label: "Import",
    icon: <ImportOutlined />,
    onClick: handleImport,
    type: "default"
  }
];

return (
  <UniversalPage
    title="Advanced Page"
    statusFilters={statusFilters}
    activeStatusFilter={activeStatusFilter}
    onStatusFilterChange={handleStatusFilterChange}
    customActions={customActions}
    createButtonLabel="Create Item"
    createButtonIcon={<PlusOutlined />}
    onCreateClick={handleCustomCreate}
    tableProps={tableProps}
    tableClassName="advanced-table"
    entityName="items"
    customStyles={`
      .advanced-table .special-column {
        background-color: rgba(255, 255, 255, 0.02);
      }
    `}
  >
    {/* Table columns */}
  </UniversalPage>
);
```

## Props

### UniversalPageProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | - | Page title displayed at the top |
| `statusFilters` | `StatusFilter[]` | ✅ | - | Array of status filter configurations |
| `activeStatusFilter` | `string` | ✅ | - | Currently active filter key |
| `onStatusFilterChange` | `(key: string) => void` | ✅ | - | Handler for filter changes |
| `showCreateButton` | `boolean` | ❌ | `true` | Whether to show create button |
| `createButtonLabel` | `string` | ❌ | - | Custom label for create button |
| `createButtonIcon` | `ReactNode` | ❌ | - | Icon for create button |
| `onCreateClick` | `() => void` | ❌ | - | Custom create handler (overrides default) |
| `customActions` | `ActionButton[]` | ❌ | `[]` | Additional action buttons |
| `tableProps` | `TableProps<any>` | ✅ | - | Ant Design table props |
| `tableClassName` | `string` | ❌ | `''` | CSS class for table styling |
| `children` | `ReactNode` | ✅ | - | Table.Column components |
| `customStyles` | `string` | ❌ | `''` | Additional CSS styles |
| `entityName` | `string` | ❌ | `'items'` | Entity name for pagination text |

### StatusFilter Interface

```tsx
interface StatusFilter {
  key: string;           // Unique identifier
  label: string;         // Display text
  icon: ReactNode;       // Icon component
  color: string;         // Primary color (hex)
  bgColor?: string;      // Background color (rgba)
  borderColor?: string;  // Border color (rgba)
  count: number;         // Item count for this filter
}
```

### ActionButton Interface

```tsx
interface ActionButton {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  loading?: boolean;
  disabled?: boolean;
}
```

## Styling

The component automatically applies consistent styling:
- Header with title and bottom border
- Status filters with hover effects and active states
- Table with cell separators and consistent padding
- Responsive design
- Uses CSS variables from the theme system

### Custom Styling

You can add custom styles using the `customStyles` prop:

```tsx
customStyles={`
  .my-table .special-cell {
    background-color: rgba(170, 204, 0, 0.1);
  }
  .my-table .highlighted-row {
    background-color: rgba(255, 255, 255, 0.02);
  }
`}
```

## Best Practices

1. **Status Filters**: Always include an "All" filter as the first option
2. **Colors**: Use consistent color schemes across similar filter types
3. **Entity Names**: Use plural forms for entity names (e.g., "products", "customers")
4. **Table Columns**: Include a serial number/ID column as the first column
5. **Actions**: Group action buttons consistently (View, Edit, Delete order)

## Migration from Old Pages

To migrate an existing page:

1. Replace the `<List>` wrapper with `<UniversalPage>`
2. Move table configuration to `tableProps`
3. Extract status filtering logic to `statusFilters` array
4. Move create button to the `onCreateClick` prop
5. Update styling to use the new system

### Before (Old Style)
```tsx
return (
  <List>
    <Table {...tableProps}>
      <Table.Column dataIndex="id" title="ID" />
      {/* ... */}
    </Table>
  </List>
);
```

### After (Universal Style)
```tsx
return (
  <UniversalPage
    title="Items"
    statusFilters={statusFilters}
    activeStatusFilter={activeStatusFilter}
    onStatusFilterChange={handleStatusFilterChange}
    tableProps={tableProps}
    entityName="items"
  >
    <Table.Column dataIndex="id" title="ID" />
    {/* ... */}
  </UniversalPage>
);
``` 