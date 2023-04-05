import Head from 'next/head';
import Creator from '@/components/Creator';

export default function Home() {
  return (
    <div>
      <Head>
        <title>STAMPS PIXEL CREATOR</title>
        <link rel="icon" href="/icon.jpg" />
      </Head>

      <main>
        <h1>STAMPS PIXEL CREATOR</h1>
        <Creator></Creator>
      </main>

      <style jsx global>{`
        :root {
          --primary-color: yellow;
          --toastify-color-progress-dark: yellow !important;
        }
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          background: #181818;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        * {
          box-sizing: border-box;
        }

        img {
          max-width: 100%;
          height: auto;
        }

        h1,
        h2,
        p,
        ul {
          margin: 0;
        }

        ul {
          padding: 0;
          list-style: none;
        }

        button {
          padding: 0.5rem 1rem;
          font-weight: bold;
        }
        h1 {
          margin-top: 40px;
          color: #111111;
          font-family: helvetica,arial;
          text-shadow: -1px -1px 0 yellow, 1px -1px 0 yellow, -1px 1px 0 yellow, 1px 1px 0 yellow;
          text-align: center;
          margin-bottom: 0px;
        }
        button {
          background: var(--primary-color) !important;
          border: 1px solid black;
        }
      `}</style>
    </div>
  )
}
