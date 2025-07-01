import React, { ReactNode } from 'react';
import { Button, Table, TableProps } from 'antd';
import { CreateButton } from '@refinedev/antd';

// Interface for status filter configuration
export interface StatusFilter {
  key: string;
  label: string;
  icon: ReactNode;
  color: string;
  bgColor?: string;
  borderColor?: string;
  count: number;
}

// Interface for action button configuration
export interface ActionButton {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  loading?: boolean;
  disabled?: boolean;
}

// Props interface for the universal page component
export interface UniversalPageProps {
  title: string;
  statusFilters: StatusFilter[];
  activeStatusFilter: string;
  onStatusFilterChange: (key: string) => void;
  showCreateButton?: boolean;
  createButtonLabel?: string;
  createButtonIcon?: ReactNode;
  onCreateClick?: () => void;
  customActions?: ActionButton[];
  tableProps: TableProps<any>;
  tableClassName?: string;
  children: ReactNode; // Table columns
  customStyles?: string;
  entityName?: string; // e.g., "products", "customers" for pagination text
}

const UniversalPage: React.FC<UniversalPageProps> = ({
  title,
  statusFilters,
  activeStatusFilter,
  onStatusFilterChange,
  showCreateButton = true,
  createButtonLabel,
  createButtonIcon,
  onCreateClick,
  customActions = [],
  tableProps,
  tableClassName = '',
  children,
  customStyles = '',
  entityName = 'items'
}) => {
  const defaultTableStyles = `
    .${tableClassName} .ant-table-cell {
      padding-top: 16px !important;
      padding-bottom: 16px !important;
      position: relative;
    }
    .${tableClassName} .ant-table-cell:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 25%;
      height: 50%;
      width: 1px;
      background-color: rgba(255, 255, 255, 0.08);
    }
    .${tableClassName} .ant-table-thead > tr > th {
      text-align: left !important;
    }
    .ant-table-measure-row {
      display: none !important;
    }
  `;

  return (
    <>
      <style>{defaultTableStyles + customStyles}</style>
      
      {/* Page Header */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
        paddingBottom: '24px',
        marginBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Page Title */}
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 700,
          margin: 0,
          color: 'var(--text-primary)'
        }}>
          {title}
        </h1>
        
        {/* Status Filters and Actions Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%' 
        }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {statusFilters.map(filter => (
              <Button 
                key={filter.key}
                onClick={() => onStatusFilterChange(filter.key)}
                type="default"
                className="icon-text-separator"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '36px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: activeStatusFilter === filter.key 
                    ? (filter.bgColor || filter.color + '26') 
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: activeStatusFilter === filter.key 
                    ? (filter.borderColor || filter.color + '4D') 
                    : 'rgba(255, 255, 255, 0.15)',
                  color: activeStatusFilter === filter.key 
                    ? filter.color 
                    : 'var(--text-tertiary)',
                  transition: '0.2s',
                  boxShadow: activeStatusFilter === filter.key 
                    ? `0 0 0 2px ${filter.bgColor || filter.color + '26'}` 
                    : 'none'
                }}
                icon={filter.icon}
              >
                <span style={{ marginLeft: '6px' }}>{filter.label}</span>
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: activeStatusFilter === filter.key 
                    ? 'rgba(0,0,0,0.125)' 
                    : 'rgba(255,255,255,0.1)',
                  color: activeStatusFilter === filter.key 
                    ? filter.color 
                    : 'var(--text-tertiary)',
                  minWidth: '20px',
                  textAlign: 'center',
                  border: activeStatusFilter === filter.key 
                    ? '1px solid rgba(0,0,0,0.1)' 
                    : '1px solid rgba(255,255,255,0.1)'
                }}>
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Custom Action Buttons */}
            {customActions.map(action => (
              <Button
                key={action.key}
                type={action.type || 'default'}
                icon={action.icon}
                onClick={action.onClick}
                loading={action.loading}
                disabled={action.disabled}
                className="icon-text-separator"
              >
                {action.label}
              </Button>
            ))}
            
            {/* Create Button */}
            {showCreateButton && (
              onCreateClick ? (
                <Button 
                  type="primary" 
                  onClick={onCreateClick} 
                  icon={createButtonIcon}
                  className="icon-text-separator"
                >
                  {createButtonLabel}
                </Button>
              ) : (
                <CreateButton />
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Table */}
      <Table 
        {...tableProps}
        className={tableClassName}
        tableLayout="auto"
        size="middle"
        bordered={false}
        pagination={{
          ...tableProps.pagination,
          showTotal: (total, range) => (
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {range[0]}-{range[1]} of {total} {entityName}
            </span>
          ),
          pageSizeOptions: ["10", "20", "50", "100"],
          showSizeChanger: true,
          style: { fontFamily: 'var(--font-body)' }
        }}
      >
        {children}
      </Table>
    </>
  );
};

export default UniversalPage; 