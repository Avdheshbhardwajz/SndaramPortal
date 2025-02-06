import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface Change {
  key: string;
  oldValue: unknown;
  newValue: unknown;
}

interface ChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  changes: {
    old_data: Record<string, unknown>;
    new_data: Record<string, unknown>;
  };
  tableName: string;
}

export const ChangesDialog = ({
  isOpen,
  onClose,
  changes,
  tableName,
}: ChangesDialogProps) => {
  const getChangedFields = (): Change[] => {
    const changedFields: Change[] = [];
    const { old_data, new_data } = changes;

    const allKeys = new Set([
      ...Object.keys(old_data),
      ...Object.keys(new_data),
    ]);

    allKeys.forEach((key) => {
      const oldValue = old_data[key];
      const newValue = new_data[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changedFields.push({
          key,
          oldValue,
          newValue,
        });
      }
    });

    return changedFields;
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const changedFields = getChangedFields();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Changes in {tableName}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Modified Fields ({changedFields.length})
            </h3>
          </div>
          <div className="space-y-4">
            {changedFields.map((change, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {change.key}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Old Value</div>
                    <div className="text-sm text-gray-900 break-words bg-white p-2 rounded border border-gray-200">
                      {formatValue(change.oldValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">New Value</div>
                    <div className="text-sm text-gray-900 break-words bg-white p-2 rounded border border-gray-200">
                      {formatValue(change.newValue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
