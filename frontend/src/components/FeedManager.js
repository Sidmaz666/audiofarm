import { PersistedAppState } from "@peach/state";
import { useGlobalState, Peachy } from "@peach/component"; // For component state, not form inputs

export default function FeedManager() {
  // Component state for feeds
  const [feeds, setFeeds] = useGlobalState(PersistedAppState, "feed");

  // Delete a feed by index
  const deleteFeed = (index) => {
    if (index === 0 && feeds?.length === 1) {
      setFeeds([]);
      return;
    }
    const updatedFeeds = feeds?.filter((_, i) => i !== index);
    if (updatedFeeds.length > 0) setFeeds(updatedFeeds);
  };

  // Add a new feed from form submission
  const addFeed = (e) => {
    e.preventDefault();
    const form = e.target;
    const newFeed = {
      label: form.label.value,
      query: form.query.value,
      page: 1,
      limit: 9,
    };
    const _f = (feeds && [...feeds]) || [];
    const updatedFeeds = [newFeed, ..._f];
    if (updatedFeeds.length > 0 && _f.length !== updatedFeeds.length)
      setFeeds(updatedFeeds);
    form.reset(); // Clear form inputs after submission
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h4 className="text-lg font-semibold text-foreground">Add Feeds</h4>

      {/* Form to add new feed */}
      <form onSubmit={addFeed} className="flex flex-col gap-2">
        <input
          type="text"
          name="label"
          placeholder="Name"
          className="bg-background border border-border
        text-foreground p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-background transition-colors
        placeholder:font-mono placeholder:tracking-wider placeholder:uppercase"
          required
        />
        <input
          type="text"
          name="query"
          placeholder="Search Query"
          className="bg-background border border-border
        text-foreground p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-background transition-colors
        placeholder:font-mono placeholder:tracking-wider placeholder:uppercase"
          required
        />
        <button
          type="submit"
          className="mt-2 mb-4 bg-primary text-primary-foreground rounded-md p-2 hover:bg-primary/90"
        >
          Add Feed
        </button>
      </form>

      {/* Responsive Feed Display */}
      {feeds && feeds.length > 0 && (
        <div className="overflow-x-auto">
          {/* Table for larger screens */}
          <table className="hidden sm:table w-full border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Search</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {feeds?.map((feed, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="p-2">{feed.label}</td>
                  <td className="p-2">{feed.query}</td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteFeed(index)}
                      className="text-destructive hover:text-destructive/80 flex justify-center items-center w-full"
                    >
                      <svg
                        className="w-5 h-5 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Card layout for smaller screens */}
          <div className="sm:hidden flex flex-col gap-4">
            {feeds?.map((feed, index) => (
              <div
                key={index}
                className="p-4 bg-card border border-border rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-base font-medium">{feed.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {feed.query}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteFeed(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <svg
                      className="w-5 h-5 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
