import styles from "./about.module.css";
import Image from "next/image";

export function About() {
  return (
    <div className={styles.about}>
      <div className={styles.section}>
        <h3>Welcome to The Recipe Room</h3>
        <p>
          The Recipe Room is a digital cookbook — a place to collect, save, and
          easily find your favorite recipes. Whether you&apos;re bookmarking
          dishes from the web, saving family favorites, or building your own
          recipe archive, this app helps you stay organized and quickly access
          the meals you love.
        </p>
      </div>

      <div className={styles.section}>
        <h3>Why I Built This</h3>
        <p>
          As someone who loves cooking but often struggled with keeping track of
          recipes from cookbooks, handwritten notes, online blogs, and family
          traditions, I wanted to create a simple, beautiful solution that
          brings all my recipes together in one easy-to-use space.
        </p>
        <p>
          The idea came from the frustration of losing track of recipes and
          spending too much time searching. I built The Recipe Room to be a
          personal digital cookbook — a place where my favorite recipes are
          always within reach, organized, and ready to inspire my next meal.
        </p>
      </div>

      <div className={styles.section}>
        <h3>Key Features</h3>
        <ul>
          <li>
            <strong>Smart Recipe Management:</strong> Organize your recipes with
            categories, search functionality, and easy editing capabilities.
          </li>
          <li>
            <strong>AI Chef Assistant:</strong> Get cooking advice, ingredient
            substitutions, and recipe modifications from our AI chef.
          </li>
          <li>
            <strong>AI-Powered Recipe Extraction:</strong> Upload photos of
            recipes from cookbooks, handwritten notes, or any recipe image, and
            our AI will automatically extract all the details.
          </li>
        </ul>
      </div>

      <div className={styles.section}>
        <h3>Future Plans</h3>
        <p>
          This is just the beginning! I&apos;m constantly working on new
          features including:
        </p>
        <ul>
          <li>More recipes will be added to the database</li>
          <li>Shopping list generation from recipes</li>
          <li>Meal planning and scheduling</li>
          <li>Recipe sharing with friends and family</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h3>Get in Touch</h3>
        <p>
          I&apos;d love to hear your feedback, suggestions, or even just chat
          about cooking! The Recipe Room was built with a love for food, and
          I&apos;m always looking for ways to make it better for you.
        </p>
        <p>
          Whether you&apos;re a home cook, a professional chef, or somewhere in
          between, I hope The Recipe Room becomes a go-to space for your
          favorite recipes.
        </p>
      </div>

      <div className={styles.section}>
        <h3>About This App</h3>
        <p>
          The Recipe Room is built with modern web technologies to provide a fast,
          reliable, and user-friendly experience.
        </p>
        <div className={styles.techInfo}>
          <div className={styles.techStack}>
            <h4>Technology Stack</h4>
            <ul>
              <li><strong>Frontend:</strong> Next.js 15, React 18, TypeScript</li>
              <li><strong>UI:</strong> @khamudom/lumen-ui-react</li>
              <li><strong>Database:</strong> Supabase (PostgreSQL)</li>
              <li><strong>Authentication:</strong> Supabase Auth</li>
              <li><strong>AI Features:</strong> OpenAI API</li>
              <li><strong>Styling:</strong> CSS Modules + Lumen design tokens</li>
              <li><strong>PWA:</strong> Next.js PWA</li>
            </ul>
          </div>
          <div className={styles.appInfo}>
            <p><strong>Version:</strong> 0.1.0</p>
            <p>
              <strong>Source Code:</strong>{" "}
              <a
                href="https://github.com/khamudom/the-recipe-room"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
              >
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          <em>Happy cooking!</em>
          <Image
            src="/assets/chef-gusto-arms-crossed.webp"
            alt="Chef Gusto"
            width={60}
            height={60}
            sizes="60px"
            quality={85}
            loading="lazy"
          />
        </p>
      </div>
    </div>
  );
}
