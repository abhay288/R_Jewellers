"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  useEffect(() => {
    if (onRowSelectionChange) {
      const selected = table.getSelectedRowModel().rows.map(row => row.original);
      onRowSelectionChange(selected);
    }
  }, [rowSelection, table, onRowSelectionChange]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {searchKey && (
        <div className="flex items-center">
          <div className="flex items-center bg-secondary/50 rounded-lg px-3 py-2 border border-border/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-full md:max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b border-border/50 bg-secondary/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 transition-colors hover:bg-secondary/30 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="h-8 w-8 p-0 rounded-md border border-border/50 bg-transparent flex items-center justify-center disabled:opacity-50"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              className="h-8 w-8 p-0 rounded-md border border-border/50 bg-transparent flex items-center justify-center disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="h-8 w-8 p-0 rounded-md border border-border/50 bg-transparent flex items-center justify-center disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              className="h-8 w-8 p-0 rounded-md border border-border/50 bg-transparent flex items-center justify-center disabled:opacity-50"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SortableHeader({ column, title }: { column: any, title: string }) {
  return (
    <button
      className="flex items-center space-x-1 hover:text-foreground transition-colors"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{title}</span>
      <ArrowUpDown className="w-3 h-3 ml-1" />
    </button>
  );
}
