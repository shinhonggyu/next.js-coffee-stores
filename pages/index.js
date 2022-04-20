import styles from "../styles/Home.module.css";
import Head from "next/head";
import Image from "next/image";
import Banner from "../components/Banner";
import Card from "../components/card";
import { fetchCoffeeStores } from "../lib/coffee-stores";

// getStaticProps: get a cached version from CDN
// 룰1. can only be exported from page file
// 룰2. meant for all routes
// 서버에서 불려지므로 원하는 서버코드 가능. 클라이언트 소스(번들)에 포함x
export async function getStaticProps(context) {
  const coffeeStores = await fetchCoffeeStores();
  return {
    props: {
      coffeeStores,
    }, // will be passed to the page component as props
  };
}

// 룰1. 컴포넌트, 룰2. export
export default function Home(props) {
  const handleOnBannerBtnClick = () => {
    console.log("hi bannerBtn");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Banner
          buttonText={"View stores nearby"}
          handleOnClick={handleOnBannerBtnClick}
        />
        <div className={styles.heroImage}>
          <Image
            src="/static/heroimage.png"
            width={700}
            height={500}
            alt="hero"
          />
        </div>
        {props.coffeeStores.length > 0 && (
          <>
            <h2 className={styles.heading2}>Toronto stores</h2>
            <div className={styles.cardLayout}>
              {props.coffeeStores.map((coffeeStore) => {
                return (
                  <Card
                    key={coffeeStore.id}
                    name={coffeeStore.name}
                    imgUrl={
                      coffeeStore.imgUrl ||
                      "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                    }
                    href={`/coffee-store/${coffeeStore.id}`}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
