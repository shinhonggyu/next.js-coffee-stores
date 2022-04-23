import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import cls from "classnames";
import styles from "../../styles/coffee-store.module.css";
import { fetchCoffeeStores } from "../../lib/coffee-stores";
import { useStoreState } from "../../store/store-context";
import { isEmpty } from "../../utils";

export async function getStaticProps(staticProps) {
  const params = staticProps.params;

  const coffeeStores = await fetchCoffeeStores(undefined, "coffee store", 7);
  const findCoffeeStoreById = coffeeStores.find((coffeStore) => {
    return coffeStore.id.toString() === params.id;
  });

  return {
    props: {
      coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {},
    },
  };
}

export async function getStaticPaths() {
  const coffeeStores = await fetchCoffeeStores(undefined, "coffee store", 7);
  const paths = coffeeStores.map((coffeeStore) => {
    return {
      params: {
        id: coffeeStore.id.toString(),
      },
    };
  });
  return {
    // pre render
    paths,
    // after first user access , cache to CDN
    fallback: true,
  };
}

const CoffeeStore = (initialProps) => {
  const router = useRouter();
  const { coffeeStores } = useStoreState();
  const [coffeeStore, setCoffeeStore] = useState(
    initialProps.coffeeStore || {}
  );
  const id = router.query.id;

  console.log("initialProps.coffeeStore", initialProps.coffeeStore);

  useEffect(() => {
    if (isEmpty(initialProps.coffeeStore || {})) {
      if (coffeeStores.length > 0) {
        const findCoffeeStoreById = coffeeStores.find((coffeStore) => {
          return coffeStore.id.toString() === id;
        });
        setCoffeeStore(findCoffeeStoreById);
      }
    }
  }, [id, coffeeStores, initialProps.coffeeStore]);

  console.log("coffeeStore", coffeeStore);

  const { name, address, neighbourhood, imgUrl } = coffeeStore;

  // getStaticPaths 에 없고 fallback: true
  if (router.isFallback) {
    return <div>로딩중입니다...</div>;
  }

  const handleUpvoteBtn = () => {
    console.log("handleUpvoteBtn");
  };

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">
              <a>← Back to home</a>
            </Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <div className={styles.storeImgWrapper}>
            <Image
              src={
                imgUrl ||
                "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
              }
              width={600}
              height={360}
              alt={name}
              className={styles.storeImg}
            />
          </div>
        </div>

        <div className={cls("glass", styles.col2)}>
          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/places.svg"
              width={24}
              height={24}
              alt="iconImg"
            />
            <p className={styles.text}>{address}</p>
          </div>
          {neighbourhood && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/nearMe.svg"
                width={24}
                height={24}
                alt="iconImg"
              />
              <p className={styles.text}>{neighbourhood}</p>
            </div>
          )}
          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/star.svg"
              width={24}
              height={24}
              alt="iconImg"
            />
            <p className={styles.text}>1</p>
          </div>

          <button className={styles.upvoteButton} onClick={handleUpvoteBtn}>
            Up vote!
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeStore;
