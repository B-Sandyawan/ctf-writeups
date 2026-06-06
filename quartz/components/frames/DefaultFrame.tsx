import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
import { resolveRelative, pathToRoot, FullSlug } from "../../util/path"

const Header = HeaderConstructor()

/**
 * The default page frame — three-column layout with left sidebar, center
 * content (header + body + afterBody), and right sidebar, followed by a footer.
 *
 * This is the original Quartz layout, extracted from renderPage.tsx.
 */
export const DefaultFrame: PageFrame = {
  name: "default",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer: Footer,
  }: PageFrameProps) {
    const { fileData, cfg } = componentData
    const slug = fileData.slug ?? ""
    
    // Determine active navigation state based on slug or tags
    const tags = fileData.frontmatter?.tags ?? []
    const isStarred = slug === "tags/star"
    const isTags = slug === "tags" || slug === "tags/index"
    const isArchives = slug.startsWith("archives") || tags.includes("archive") || tags.includes("archives") || tags.includes("CTF") || tags.includes("ctf")
    const isNotes = slug.startsWith("notes") || tags.includes("note") || tags.includes("notes") || tags.includes("research")
    const isVault = !isStarred && !isTags && !isArchives && !isNotes

    // Resolve relative URLs for navigation links to support subpath hosting
    const baseDir = pathToRoot(slug)
    const homeUrl = baseDir || "."
    const archivesUrl = resolveRelative(slug, "archives" as FullSlug)
    const notesUrl = resolveRelative(slug, "notes" as FullSlug)

    return (
      <>
        <header class="top-bar">
          <div class="top-bar-left">
            <span class="material-symbols-outlined logo-icon">shield</span>
            <a href={homeUrl} class="site-title">{cfg.pageTitle}</a>
          </div>
          
          <nav class="top-bar-center">
            <a href={homeUrl} class={`nav-link ${isVault ? "active" : ""}`}>Vault</a>
            <a href={archivesUrl} class={`nav-link ${isArchives ? "active" : ""}`}>Archives</a>
            <a href={notesUrl} class={`nav-link ${isNotes ? "active" : ""}`}>Notes</a>
          </nav>
          
          <div class="top-bar-right">
            <button class="icon-btn theme-trigger" aria-label="Toggle Theme" onClick={() => document.getElementById("darkmode")?.click()}>
              <span class="material-symbols-outlined">dark_mode</span>
            </button>
            <button class="icon-btn reader-trigger" aria-label="Toggle Reader Mode" onClick={() => document.getElementById("reader-mode-toggle")?.click()}>
              <span class="material-symbols-outlined">chrome_reader_mode</span>
            </button>
          </div>
        </header>

        <div class="left sidebar">
          <ul class="sidebar-menu">
            <li class={isVault ? "active" : ""}>
              <a href={homeUrl}>
                <span class="material-symbols-outlined">folder</span>
                <span>Vault</span>
              </a>
            </li>
            <li>
              <a href={`${homeUrl}#recent-notes-section`} onClick={(e) => {
                const recent = document.querySelector(".recent-notes")
                if (recent) {
                  e.preventDefault()
                  recent.scrollIntoView({ behavior: "smooth" })
                }
              }}>
                <span class="material-symbols-outlined">history</span>
                <span>Recent</span>
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => {
                const graphIcon = document.querySelector(".global-graph-icon") as HTMLElement
                if (graphIcon) {
                  e.preventDefault()
                  graphIcon.click()
                }
              }}>
                <span class="material-symbols-outlined">hub</span>
                <span>Graph</span>
              </a>
            </li>
            <li class={slug === "tags/star" ? "active" : ""}>
              <a href={resolveRelative(slug, "tags/star" as FullSlug)}>
                <span class="material-symbols-outlined">star</span>
                <span>Starred</span>
              </a>
            </li>
            <li class={slug === "tags" || slug === "tags/index" ? "active" : ""}>
              <a href={resolveRelative(slug, "tags" as FullSlug)}>
                <span class="material-symbols-outlined">tag</span>
                <span>Tags</span>
              </a>
            </li>
          </ul>
          
          {/* Render hidden components to keep them in DOM for top-bar click triggers */}
          <div style="display:none;">
            {left.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>

          <Footer {...componentData} />
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          function initTagPage() {
            const container = document.querySelector('body[data-slug="tags"] .popover-hint');
            if (!container || container.querySelector('.tag-search-wrapper')) return;
            const tagListContainer = container.querySelector('div:last-child');
            if (!tagListContainer) return;
            tagListContainer.querySelectorAll('> div').forEach(div => {
              const link = div.querySelector('a.tag-link');
              const countText = div.querySelector('.page-listing p')?.textContent;
              if (link && countText) {
                const match = countText.match(/\\d+/);
                if (match) {
                  link.textContent = link.textContent + " (" + match[0] + ")";
                }
              }
            });
            const wrapper = document.createElement('div');
            wrapper.className = 'tag-search-wrapper';
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search tags...';
            searchInput.className = 'tag-search-input';
            wrapper.appendChild(searchInput);
            container.insertBefore(wrapper, tagListContainer);
            searchInput.addEventListener('input', (e) => {
              const query = e.target.value.toLowerCase();
              tagListContainer.querySelectorAll('> div').forEach(div => {
                const link = div.querySelector('a.tag-link');
                if (link) {
                  const name = link.textContent.split('(')[0].trim().toLowerCase();
                  if (name.includes(query)) {
                    div.style.display = 'inline-block';
                  } else {
                    div.style.display = 'none';
                  }
                }
              });
            });
          }
          document.addEventListener("DOMContentLoaded", initTagPage);
          document.addEventListener("nav", initTagPage);
        ` }} />
        <div class="center">
          <div class="page-header">
            <Header {...componentData}>
              {header.map((HeaderComponent) => (
                <HeaderComponent {...componentData} />
              ))}
            </Header>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => (
                <BodyComponent {...componentData} />
              ))}
            </div>
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </div>
        <div class="right sidebar">
          {right.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
      </>
    )
  },
}
