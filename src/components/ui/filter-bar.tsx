import * as React from "react"
import { Search, Filter, SortAsc, LayoutGrid, List } from "lucide-react"
import { Input } from "./input"
import { Button } from "./button"

export interface FilterBarProps {
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  
  hasFilters?: boolean;
  onFilterClick?: () => void;
  
  hasSort?: boolean;
  onSortClick?: () => void;
  
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  
  bulkActions?: React.ReactNode;
  
  className?: string;
}

export function FilterBar({
  onSearch,
  searchValue,
  searchPlaceholder = "Search...",
  hasFilters,
  onFilterClick,
  hasSort,
  onSortClick,
  viewMode,
  onViewModeChange,
  bulkActions,
  className
}: FilterBarProps) {
  return (
    <div className={`p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className || ""}`}>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {onSearch !== undefined && (
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        )}
        
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={onFilterClick} className="bg-white">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        )}
        
        {hasSort && (
          <Button variant="outline" size="sm" onClick={onSortClick} className="bg-white">
            <SortAsc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {bulkActions && (
          <div className="flex items-center mr-2">
            {bulkActions}
          </div>
        )}
        
        {onViewModeChange && (
          <div className="flex items-center bg-white rounded-md border border-gray-200 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 py-0 ${viewMode === 'list' ? 'bg-gray-100 shadow-sm' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 py-0 ${viewMode === 'grid' ? 'bg-gray-100 shadow-sm' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
