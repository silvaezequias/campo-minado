import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import { Check } from "lucide-react";
import React from "react";

export default function ComponentsPlayground() {
  return (
    <div className="p-10 flex flex-col gap-16">
      <ComponentMatrix
        title="Button"
        category="Sizes"
        rows={["smr", "sm", "md", "lg", "xl"]}
        columns={["default", "primary"]}
        render={(size, variant, aspectSquare) => (
          <Button
            size={size as ButtonSize}
            variant={variant as ButtonVariant}
            aspect={aspectSquare ? "square" : "no-aspect"}
          >
            Botão
          </Button>
        )}
      />

      <ComponentMatrix
        title="Button with Icon"
        category="Icon"
        rows={["smr", "sm", "md", "lg", "xl"]}
        columns={["default", "primary"]}
        render={(size, variant, aspectSquare) => (
          <Button
            size={size as ButtonSize}
            variant={variant as ButtonVariant}
            icon={Check}
            aspect={aspectSquare ? "square" : "no-aspect"}
          />
        )}
      />

      <ComponentMatrix
        title="Button with icon and text"
        category="Icon + Text"
        rows={["smr", "sm", "md", "lg", "xl"]}
        columns={["default", "primary"]}
        render={(size, variant, aspectSquare) => (
          <Button
            size={size as ButtonSize}
            variant={variant as ButtonVariant}
            icon={Check}
            aspect={aspectSquare ? "square" : "no-aspect"}
          >
            Botão
          </Button>
        )}
      />
    </div>
  );
}

type ComponentMatrixProps<R extends string, C extends string> = {
  title: string;
  category: string;
  rows: R[];
  columns: C[];
  render: (row: R, column: C, aspectSquare?: boolean) => React.ReactNode;
};

export function ComponentMatrix<R extends string, C extends string>({
  title,
  category,
  rows,
  columns,
  render,
}: ComponentMatrixProps<R, C>) {
  return (
    <div className="flex flex-col gap-6 border-b-4 border-zinc-900 pb-10">
      <h3 className="text-3xl font-bold">{title}</h3>
      <div className="flex w-full gap-5 justify-center">
        <Table
          category={category}
          columns={columns}
          render={render}
          rows={rows}
          renderAspectSquare={false}
        />
        <Table
          category={category + " + Aspect Square"}
          columns={columns}
          rows={rows}
          render={render}
          renderAspectSquare={true}
        />
      </div>
    </div>
  );
}

type TableProps<R extends string, C extends string> = {
  category: string;
  rows: R[];
  columns: C[];
  renderAspectSquare?: boolean;
  render: (row: R, column: C, aspectSquare?: boolean) => React.ReactNode;
};

const Table = <R extends string, C extends string>({
  category,
  columns,
  render,
  rows,
  renderAspectSquare = false,
}: TableProps<R, C>) => {
  return (
    <div className="flex flex-col gap-6 border-4 border-zinc-900 rounded-xl p-6">
      <h4 className="text-md font-semibold text-zinc-500 uppercase">
        {category}
      </h4>

      <div
        className="grid gap-6 items-center"
        style={{
          gridTemplateColumns: `120px repeat(${columns.length}, 1fr)`,
        }}
      >
        {/* Header */}
        <div />
        {columns.map((column) => (
          <div
            key={column}
            className="text-sm font-semibold text-zinc-500 uppercase text-center"
          >
            {column}
          </div>
        ))}

        {/* Rows */}
        {rows.map((row) => (
          <React.Fragment key={row}>
            <div className="text-sm font-semibold text-zinc-500 uppercase">
              {row}
            </div>

            {columns.map((column) => (
              <div
                key={row + column}
                className="flex items-center justify-center"
              >
                {render(row, column, renderAspectSquare)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
