import React from "react";
import { create } from "zustand";

interface DataModal {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode | null;
  onOpen: (title: string, children: React.ReactNode) => void;
  onClose: () => void;
}

const useDataModal = create<DataModal>((set) => ({
  isOpen: false,
  title: "",
  children: null,
  onOpen: (title, children) => {
    set({
      isOpen: true,
      title: title,
      children: children,
    });
  },
  onClose: () => {
    set({
      isOpen: false,
      title: "",
      children: null,
    });
  },
}));

export default useDataModal;
