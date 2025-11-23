import React, { useState, useEffect, type JSX } from "react";

interface Category {
  id: number;
  name: string;
  childCategory: Category[];
}

interface Props {
  categories: Category[];
  selectedCategoryId: number | null;
  onChange: (id: number) => void;
}

export default function CategorySelect({ categories, selectedCategoryId, onChange }: Props) {
  // helper để render tree dạng đệ quy
  const renderOptions = (cats: Category[], level = 0): JSX.Element[] => {
    return cats.flatMap((cat) => [
      <option key={cat.id} value={cat.id}>
        {`${"— ".repeat(level)}${cat.name}`}
      </option>,
      ...renderOptions(cat.childCategory, level + 1),
    ]);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Danh mục</label>
      <select
        value={selectedCategoryId ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full p-2 border rounded-xl"
      >
        <option value="">Chọn danh mục</option>
        {renderOptions(categories)}
      </select>
    </div>
  );
}
