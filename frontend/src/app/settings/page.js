import { Peachy } from "@peach/component";
import Accordion from "@components/Accordion";
import ThemeSelector from "@components/ThemeSelector";
import FeedManager from "@components/FeedManager";
import Overview from "@components/Overview";

export default function SettingsPage() {
  return (
    <section className="flex-1 container mx-auto px-4 pb-20 relative z-10 py-20 pt-6 flex flex-col">
      <div className="flex w-full justify-between items-center mb-4">
        <span className="font-bold font-mono text-2xl">Settings</span>
      </div>
      <div className="flex w-full  flex-col gap-2">
        <Accordion title="Overview">
          <Overview />
        </Accordion>
        <Accordion title="Feed">
          <FeedManager />
        </Accordion>
        <Accordion title="Themes">
          <ThemeSelector />
        </Accordion>
        <Accordion title="About">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-foreground">
              About the App
            </h3>
            <p className="text-sm text-muted-foreground">
              This is a simple yet powerful music player app that uses YouTube
              as its media source. Enjoy seamless playback, create and manage
              playlists, save your favorite tracks, and download videos for
              offline access. Explore your listening history and organize your
              music collection with ease.
            </p>
            <div className="flex flex-col gap-2">
              <h4 className="text-base font-medium text-foreground">
                Key Features
              </h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Stream music and videos directly from YouTube.</li>
                <li>Download videos for offline playback.</li>
                <li>Create and manage custom playlists.</li>
                <li>Save and organize favorite tracks.</li>
                <li>Track your listening history.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-base font-medium text-foreground">Author</h4>
              <p className="text-sm text-muted-foreground">
                Developed by{" "}
                <a
                  href="https://github.com/sidmaz666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  sidmaz666
                </a>{" "}
                on GitHub.
              </p>
            </div>
          </div>
        </Accordion>
      </div>
    </section>
  );
}
