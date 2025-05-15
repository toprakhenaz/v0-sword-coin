"use client"

import type { ConfirmationPopupProps } from "@/types"

export default function ConfirmationPopup({ title, message, onConfirm, onCancel }: ConfirmationPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            İptal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Onayla
          </button>
        </div>
      </div>
    </div>
  )
}
