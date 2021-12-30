import React, { useState, useEffect, useRef } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import ResizeObserver from "rc-resize-observer";
import { Table, Popover } from "antd";
import classNames from "classnames";

export default function VirtualTable(props: Parameters<typeof Table>[0]) {
  // eslint-disable-next-line react/prop-types
  const { columns, scroll } = props;
  const [tableWidth, setTableWidth] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const widthColumnCount = columns!.filter(({ width }) => !width).length;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const mergedColumns = columns!.map(column => {
    if (column.width) {
      return column;
    }

    return {
      ...column,
      width: Math.floor(tableWidth / widthColumnCount),
    };
  });

  const gridRef = useRef<any>();
  const [connectObject] = useState<any>(() => {
    const obj = {};
    Object.defineProperty(obj, "scrollLeft", {
      get: () => null,
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });

    return obj;
  });

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: true,
    });
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const renderVirtualList = (rawData: readonly object[], { scrollbarSize, ref, onScroll }: any) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * 36;

    return (
      <Grid
        ref={gridRef}
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={(index: number) => {
          const { width } = mergedColumns[index];
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return totalHeight > scroll!.y! && index === mergedColumns.length - 1 ? (width as number) - scrollbarSize - 1 : (width as number);
        }}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        height={scroll!.y as number}
        rowCount={rawData.length}
        rowHeight={() => 36}
        width={tableWidth}
        onScroll={({ scrollLeft }: { scrollLeft: number }) => {
          onScroll({ scrollLeft });
        }}
      >
        {({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
          let co = "";
          const isLineNumber = mergedColumns[columnIndex].render;
          if (isLineNumber) {
            co = String(rowIndex + 1);
          } else {
            co = (rawData[rowIndex] as any)[(mergedColumns as any)[columnIndex].dataIndex];
          }
          return (
            <div
              className={classNames("virtual-table-cell", {
                "virtual-table-cell-last": columnIndex === mergedColumns.length - 1,
              })}
              style={style}
            >
              {isLineNumber ? (
                <span>{co}</span>
              ) : (
                <Popover overlayStyle={{ maxWidth: "auto", wordBreak: "normal", whiteSpace: "break-spaces", maxHeight: "430px", overflowY: "auto", boxShadow: "0 -1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" }} placement="topLeft" title="Complete content" content={co}>
                  <span>{co}</span>
                </Popover>
              )}
            </div>
          );
        }}
      </Grid>
    );
  };
  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth(width);
      }}
    >
      <Table
        {...props}
        className="virtual-table"
        columns={mergedColumns}
        pagination={false}
        components={{
          body: renderVirtualList,
        }}
      />
    </ResizeObserver>
  );
}
