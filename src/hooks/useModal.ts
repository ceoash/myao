import React from "react";
import { create } from "zustand";

interface Modal {
  isOpen: boolean;
  title: string;
  children: React.ReactNode | null;
  onOpen: (title: string, children: React.ReactNode) => void;
  onClose: () => void;
}

const useModal = create<Modal>((set) => ({
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

export default useModal;
