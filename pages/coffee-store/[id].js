import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

import cls from "classnames";

import useSWR from "swr";

import styles from "../../styles/coffee-store.module.css";
import { fetchCoffeeStores } from "../../lib/coffee-stores";

import { useStoreState } from "../../store/store-context";

import { isEmpty, fetcher } from "../../utils";

export async function getStaticProps(staticProps) {
  const params = staticProps.params;

  const coffeeStores = await fetchCoffeeStores();
  const findCoffeeStoreById = coffeeStores.find((coffeeStore) => {
    return coffeeStore.id.toString() === params.id;
  });

  return {
    props: {
      coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {},
    },
  };
}

export async function getStaticPaths() {
  const coffeeStores = await fetchCoffeeStores();
  const paths = coffeeStores.map((coffeeStore) => {
    return {
      params: {
        id: coffeeStore.id.toString(),
      },
    };
  });
  return {
    paths,
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

  const handleCreateCoffeeStore = async (coffeeStore) => {
    try {
      const { id, name, address, neighbourhood, imgUrl } = coffeeStore;
      const response = await fetch("/api/createCoffeeStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          address: address || "",
          neighbourhood: neighbourhood || "",
          voting: 0,
          imgUrl,
        }),
      });

      await response.json();
    } catch (err) {
      console.error("Error creating coffee store", err);
    }
  };

  useEffect(() => {
    if (isEmpty(initialProps.coffeeStore)) {
      if (coffeeStores.length > 0) {
        const coffeeStoreFromContext = coffeeStores.find((coffeeStore) => {
          return coffeeStore.id.toString() === id;
        });

        if (coffeeStoreFromContext) {
          setCoffeeStore(coffeeStoreFromContext);
          handleCreateCoffeeStore(coffeeStoreFromContext);
        }
      }
    } else {
      // SSG pre-render
      handleCreateCoffeeStore(initialProps.coffeeStore);
    }
  }, [id, coffeeStores, initialProps, initialProps.coffeeStore]);

  const {
    name = "",
    address = "",
    neighbourhood = "",
    imgUrl = "",
  } = coffeeStore;

  const [votingCount, setVotingCount] = useState(0);

  const { data, error } = useSWR(`/api/getCoffeeStoreById?id=${id}`, fetcher);

  useEffect(() => {
    if (data && data.length > 0) {
      setCoffeeStore(data[0]);

      setVotingCount(data[0].voting);
    }
  }, [data]);

  if (router.isFallback) {
    return <div>로딩중입니다...</div>;
  }

  const handleUpvoteBtn = async () => {
    try {
      const response = await fetch("/api/favoriteCoffeeStoreById", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const dbCoffeeStore = await response.json();

      if (dbCoffeeStore && dbCoffeeStore.length > 0) {
        let count = votingCount + 1;
        setVotingCount(count);
      }
    } catch (err) {
      console.error("Error upvoting the coffee store", err);
    }
  };

  if (error) {
    return <div>Something went wrong retrieving coffee store page</div>;
  }

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
        <meta name="description" content={`${name} coffee store`}></meta>
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
            <p className={styles.text}>{votingCount}</p>
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
