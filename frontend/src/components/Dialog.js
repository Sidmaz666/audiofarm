// src/components/Dialog.jsx
import {
  Peachy,
  mountComponent,
  unmountComponent,
  useState,
} from "@peach/component";
import { addToPlaylist, getAllPlaylists } from "@utils/useDB.js";
import { useMemo } from "@utils/useMemo";

// Dialog Manager to handle dynamic creation and removal of dialogs
export class DialogManager {
  static instances = new Map();

  static show(id, contentComponent, contentProps = {}, onClose) {
    if (this.instances.has(id)) {
      // Update existing dialog
      const { container, instance } = this.instances.get(id);
      instance.props = {
        isOpen: true,
        contentProps,
        onClose,
        contentComponent,
      };
      instance.update();
      //   console.log(`Dialog ${id} updated and shown`);
      return;
    }

    // Create new dialog
    const container = document.createElement("div");
    document.body.appendChild(container);
    const instance = mountComponent(
      ({ isOpen, contentComponent: ContentComponent, contentProps, onClose }) =>
        isOpen ? (
          <div
            id={id}
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200"
            onClick={(e) => {
              if (e.target.id === id && onClose) onClose();
            }}
          >
            <div className="p-4 sm:p-6 rounded-lg bg-background border border-border md:max-w-md max-w-sm w-full">
              <ContentComponent {...contentProps} />
            </div>
          </div>
        ) : null,
      container,
      { isOpen: true, contentComponent, contentProps, onClose }
    );

    this.instances.set(id, { container, instance });
    // console.log(`Dialog ${id} created and shown`);
  }

  static hide(id) {
    const instanceData = this.instances.get(id);
    if (instanceData) {
      const { container, instance } = instanceData;
      // Directly unmount and remove without updating
      unmountComponent(container);
      container.remove();
      this.instances.delete(id);
      //   console.log(`Dialog ${id} hidden and removed`);
    }
  }
}

// src/components/ErrorDialogContent.jsx
export function ErrorDialogContent({ message, onClose }) {
  return (
    <div className="w-full h-full">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
        Error
      </h2>
      <p className="text-foreground mb-4 text-sm sm:text-base">{message}</p>
      <div className="flex justify-end">
        <button
          className="px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-md"
          aria-label="Close error dialog"
          onClick={() => {
            // console.log("ErrorDialogContent: OK clicked");
            onClose();
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

// src/components/CreatePlaylistDialogContent.jsx
export function CreatePlaylistDialogContent({ onSubmit, onCancel }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = e.target.elements[0].value;
        if (name && onSubmit) {
          //   console.log(
          //     `CreatePlaylistDialogContent: Submitted with name: ${name}`
          //   );
          onSubmit(name, e.target);
        }
      }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
        Create New Playlist
      </h2>
      <input
        type="text"
        name="name"
        placeholder="Playlist Name"
        className="w-full p-2 mb-4 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
        required
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 text-sm sm:text-base text-foreground hover:bg-muted rounded-md"
          aria-label="Cancel playlist creation"
          onClick={() => {
            // console.log("CreatePlaylistDialogContent: Cancel clicked");
            onCancel();
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-md"
          aria-label="Create playlist"
        >
          Create
        </button>
      </div>
    </form>
  );
}

// src/components/DeleteConfirmDialogContent.jsx
export function DeleteConfirmDialogContent({ title, name, onConfirm, onCancel }) {
  return (
    <div className="w-full h-full">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 text-left">
        {title ?  title : "Delete Playlist"}
      </h2>
      <p className="text-foreground mb-4 text-left text-sm sm:text-base">
        Are you sure you want to delete "{name}"?
      </p>
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 text-sm sm:text-base text-foreground hover:bg-muted rounded-md"
          aria-label="Cancel deletion"
          onClick={() => {
            // console.log("DeleteConfirmDialogContent: Cancel clicked");
            onCancel();
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 text-sm sm:text-base bg-red-500 text-white hover:bg-red-600 rounded-md"
          aria-label="Confirm deletion"
          onClick={() => {
            // console.log("DeleteConfirmDialogContent: Delete clicked");
            onConfirm(name);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// New Rename Playlist Dialog Content
export function RenamePlaylistDialogContent({
  playlistName,
  onSubmit,
  onCancel,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = e.target.elements[0].value;
        if (name && onSubmit) {
          onSubmit(playlistName, name, e.target);
        }
      }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
        Rename Playlist
      </h2>
      <input
        type="text"
        name="name"
        value={playlistName}
        placeholder="New Playlist Name"
        className="w-full p-2 mb-4 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
        required
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 text-sm sm:text-base text-foreground hover:bg-muted rounded-md"
          aria-label="Cancel rename"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-md"
          aria-label="Save renamed playlist"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export function AddToPlaylistDialogContent({ video, onSubmit, onCancel }) {
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // Fetch playlists on mount
  useMemo("PlaylistAddInt", [video, onSubmit, onCancel], async () => {
    try {
      const allPlaylists = await getAllPlaylists();
      setPlaylists([...allPlaylists]);
      // Pre-check playlists that already contain the video
      const preSelected = allPlaylists
        .filter((p) => p.items.some((item) => item.id === video.id))
        .map((p) => p.name);
      setTimeout(() => {
        // console.log({ preSelected });
        Array.from(
          document.querySelectorAll(`input[name^="input-checkbox-"]`)
        ).forEach((checkbox) => {
          const playlistName = checkbox.name.replace("input-checkbox-", "");
          if (preSelected.includes(playlistName)) {
            checkbox.checked = true;
          }
        });
      }, 100);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) {
          // console.log(e.target.elements);
          const selectedPlaylists = Array.from(e.target.elements)
            .filter((e) => {
              if (e.name.startsWith("input-checkbox-")) return e;
            })
            .map((e) => {
              return [
                e.value,
                e.checked,
              ]
            });
          onSubmit(selectedPlaylists);
        }
      }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
        Add to Playlists
      </h2>
      <div className="max-h-64 overflow-y-auto mb-4">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <label
              key={playlist.name}
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
            >
              <input
                value={playlist.name}
                name={`input-checkbox-${playlist.name?.replaceAll(" ", "-")}`}
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <span className="text-sm sm:text-base text-foreground">
                {playlist.name}
              </span>
            </label>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No playlists found. Create one first!
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 text-sm sm:text-base text-foreground hover:bg-muted rounded-md"
          aria-label="Cancel adding to playlists"
          onClick={onCancel}
        >
          Cancel
        </button>
        {playlists.length > 0 && (
          <button
            type="submit"
            className="px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-md"
            aria-label="Add to selected playlists"
          >
            Add
          </button>
        )}
      </div>
    </form>
  );
}
