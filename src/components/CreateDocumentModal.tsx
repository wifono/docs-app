import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState, useMemo } from "react";
import "../styles/CreateDocumentModal.scss";

interface Document {
  id: number;
  name: string;
  tag: string;
  description: string;
  fileName?: string;
  fileUrl?: string;
}

interface CreateDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData, documentId?: number) => void;
  existingTags: string[];
  document?: Document | null;
  mode: "create" | "edit";
}

export default function CreateDocumentModal({
  open,
  onClose,
  onSubmit,
  existingTags,
  document,
  mode,
}: CreateDocumentModalProps) {
  const getInitialName = () => (mode === "edit" && document ? document.name : "");
  const getInitialTag = () => (mode === "edit" && document ? document.tag : "");
  const getInitialDescription = () => (mode === "edit" && document ? document.description : "");

  const [name, setName] = useState(getInitialName);
  const [tag, setTag] = useState(getInitialTag);
  const [description, setDescription] = useState(getInitialDescription);
  const [file, setFile] = useState<File | null>(null);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const filteredTags = useMemo(() => {
    if (tag) {
      return existingTags.filter((t) =>
        t.toLowerCase().includes(tag.toLowerCase())
      );
    }
    return existingTags;
  }, [tag, existingTags]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Prosím zadajte názov dokumentu");
      return;
    }

    if (mode === "create" && !file) {
      alert("Prosím vyberte súbor");
      return;
    }
    
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("tag", tag.trim());
    formData.append("description", description.trim());
    
    if (mode === "create" && file) {
      formData.append("file", file);
    }

    if (mode === "edit" && document) {
      onSubmit(formData, document.id);
    } else {
      onSubmit(formData);
    }

    setName("");
    setTag("");
    setDescription("");
    setFile(null);
  };

  const handleClose = () => {
    setName("");
    setTag("");
    setDescription("");
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50 create-document-modal">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="modal-panel relative transform overflow-hidden rounded-lg px-4 pb-4 pt-5 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div>
              <DialogTitle
                as="h3"
                className="modal-title text-base font-semibold mb-4"
              >
                {mode === "edit" ? "Upraviť dokument" : "Vytvoriť nový dokument"}
              </DialogTitle>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="doc-name"
                      className="block text-sm font-medium mb-1"
                    >
                      Názov dokumentu *
                    </label>
                    <input
                      type="text"
                      id="doc-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md shadow-sm"
                      placeholder="Zadajte názov dokumentu"
                      required
                    />
                  </div>

                  {/* Tag*/}
                  <div className="relative">
                    <label
                      htmlFor="doc-tag"
                      className="block text-sm font-medium mb-1"
                    >
                      Tag
                    </label>
                    <input
                      type="text"
                      id="doc-tag"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      onFocus={() => setShowTagDropdown(true)}
                      onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                      className="w-full px-3 py-2 border rounded-md shadow-sm"
                      placeholder="Zadajte alebo vyberte tag"
                    />
                    {showTagDropdown && filteredTags.length > 0 && (
                      <div className="tag-dropdown absolute z-10 mt-1 w-full border rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredTags.map((t, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setTag(t);
                              setShowTagDropdown(false);
                            }}
                            className="tag-option px-3 py-2 cursor-pointer"
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/*subor */}
                  {mode === "create" && (
                    <div>
                      <label
                        htmlFor="doc-file"
                        className="block text-sm font-medium mb-1"
                      >
                        Súbor *
                      </label>
                      <input
                        type="file"
                        id="doc-file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border rounded-md shadow-sm"
                        required
                      />
                    </div>
                  )}

                  {/* popis */}
                  <div>
                    <label
                      htmlFor="doc-description"
                      className="block text-sm font-medium mb-1"
                    >
                      Popis
                    </label>
                    <textarea
                      id="doc-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md shadow-sm"
                      placeholder="Zadajte popis dokumentu"
                    />
                  </div>
                </div>

                {/* btns */}
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-cancel px-4 py-2 text-sm font-semibold border rounded-md"
                  >
                    Zrušiť
                  </button>
                  <button
                    type="submit"
                    className="btn-submit px-4 py-2 text-sm font-semibold rounded-md"
                  >
                    {mode === "edit" ? "Uložiť zmeny" : "Vytvoriť"}
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
