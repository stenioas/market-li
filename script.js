// para uso com arquivo local
//import market from "./db.json" assert { type: "json" };

const getFinalMarketList = (initialMarketList) => {
  // remove a prop id que não utilizamos
  const handledList = initialMarketList.map((item) => {
    delete item.id;
    return item;
  });

  // agrupa a lista por produto - retorna um objeto
  const groupedObjectByProduct = groupByProduct(handledList);

  // classifica a lista por preço dentro de cada grupo de produto - retorna um array
  const groupedRankedList = Object.entries(groupedObjectByProduct).map(
    ([key, value]) => rankAscendingList(value)
  );

  // desagrupa a lista após a classificação
  const rankedList = groupedRankedList.flat(1);

  // remove os itens com classificação acima de 3º lugar
  const cleanedRankedList = rankedList.filter((item) => item.rank < 4);

  // agrupa os itens por loja
  const groupedObjectByShop = groupByShop(cleanedRankedList);

  // gera a lista final para exibição na tela
  const finalMarketList = generateTextFinalList(groupedObjectByShop);

  return finalMarketList;
};

const generateTextFinalList = (obj) => {
  let strFinalList = "";
  Object.entries(sortAscendingObjectByKey(obj)).map(([key, value]) => {
    strFinalList = strFinalList.concat(
      "<strong>" + key.toUpperCase() + "</strong><br/>"
    );
    sortAscendingListByProduct(value).forEach((item) => {
      strFinalList = strFinalList.concat(
        item.rank +
          "º" +
          "&Tab;|&Tab;" +
          item.price.toLocaleString("pt-br", {
            style: "decimal",
            minimumFractionDigits: 2,
          }) +
          "&Tab;" +
          item.product +
          "<br/>"
      );
    });
    strFinalList = strFinalList.concat("<br/>");
  });

  return strFinalList;
};

const groupByShop = (arr) => {
  return arr.reduce((result, currentValue) => {
    (result[currentValue.shop] = result[currentValue.shop] || []).push(
      currentValue
    );
    return result;
  }, {});
};

const groupByProduct = (arr) => {
  return arr.reduce((result, currentValue) => {
    (result[currentValue.product] = result[currentValue.product] || []).push(
      currentValue
    );
    return result;
  }, {});
};

const sortAscendingListByPrice = (arr) =>
  arr.sort((itemA, itemB) => itemA.price - itemB.price);

const sortAscendingListByProduct = (arr) =>
  arr.sort((itemA, itemB) => {
    const productA = itemA.product.toUpperCase();
    const productB = itemB.product.toUpperCase();
    if (productA < productB) {
      return -1;
    }
    if (productA > productB) {
      return 1;
    }

    return 0;
  });

const sortAscendingObjectByKey = (obj) =>
  Object.entries(obj)
    .sort()
    .reduce((o, [k, v]) => ((o[k] = v), o), {});

const rankAscendingList = (arr) => {
  let rank = 1;
  return sortAscendingListByPrice(arr).map((item, index) => {
    if (index > 0 && item.price > arr[index - 1].price) {
      rank++;
    }
    item.rank = rank;
    return item;
  });
};

let url =
  "https://api.sheety.co/d3a0bd0987cadf495617032c2aa34290/marketList/list";
fetch(url)
  .then((response) => response.json())
  .then((response) => {
    $("#json").html(getFinalMarketList(response.list));
  });

// para uso com arquivo local db.json
// $("#json").html(getFinalMarketList(market.list));
