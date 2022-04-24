import styles from "../styles/Home.module.css";
import Head from "next/head";
import Image from "next/image";
import Banner from "../components/Banner";
import Card from "../components/card";
import { fetchCoffeeStores } from "../lib/coffee-stores";
import useTrackLocation from "../hooks/use-track-location";
import { useEffect, useState } from "react";
import {
  useStoreDispatch,
  ACTION_TYPES,
  useStoreState,
} from "../store/store-context";
// 기본적으로 모든 페이지 pre-render
// 언제 HTML 을 만드냐가 차이점.
// 1. Static Generation (빌드 시) - cdn cache
// 2. Server-side Rendering (요청 시) - 최신, admin

// 빌드시 서버측에서 불려지며 함수에서 반환된 props를 사용하여 이 페이지를 미리 pre-render한다.
// getStaticProps: get a cached version from CDN
// 룰1. can only be exported from page file
// 룰2. meant for all routes
// 서버에서 불려지므로 DB에서 데이터 가져오기 포함, 원하는 서버코드 가능. 클라이언트 소스(번들)에 포함x
export async function getStaticProps(context) {
  const coffeeStores = await fetchCoffeeStores(undefined, "coffee store", 8);

  return {
    props: {
      coffeeStores,
    }, // will be passed to the page component as props
  };
}

// 룰1. 컴포넌트, 룰2. export
export default function Home(props) {
  const { handleTrackLocation, locationErrorMsg, isFindingLocation } =
    useTrackLocation();

  // const [coffeeStores, setCoffeeStores] = useState("");
  const [coffeeStoresError, setCoffeeStoresError] = useState(null);

  const dispatch = useStoreDispatch();
  const { coffeeStores, latLong } = useStoreState();
  console.log({ coffeeStores, latLong });

  useEffect(() => {
    const setCoffeeStoresByLocation = async () => {
      if (latLong) {
        try {
          const response = await fetch(
            `api/getCoffeeStoresByLocation?latLong=${latLong}&query=커피&limit=30`
          );
          const coffeeStores = await response.json();

          // setCoffeeStores(fetchedCoffeeStores);

          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORES,
            payload: {
              coffeeStores,
            },
          });
          setCoffeeStoresError("");
          // set coffee stores
        } catch (error) {
          console.log({ error });
          setCoffeeStoresError(error.message);
          // set error
        }
      }
    };

    setCoffeeStoresByLocation();
  }, [latLong, dispatch]);

  const handleOnBannerBtnClick = () => {
    handleTrackLocation();
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
          buttonText={isFindingLocation ? "Locating.." : "View stores nearby"}
          handleOnClick={handleOnBannerBtnClick}
        />
        {locationErrorMsg && <p>Something went wrong: {locationErrorMsg}</p>}
        {coffeeStoresError && <p>Something went wrong: {coffeeStoresError}</p>}
        <div className={styles.heroImage}>
          <Image
            src="/static/heroimage.png"
            width={700}
            height={500}
            alt="hero"
          />
        </div>

        {coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Stores near me</h2>
            <div className={styles.cardLayout}>
              {coffeeStores.map((coffeeStore) => {
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
          </div>
        )}

        {props.coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
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
          </div>
        )}
      </main>
    </div>
  );
}
