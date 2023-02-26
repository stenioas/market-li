// para uso com arquivo local
import database from "./db.json" assert { type: "json" };

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
  const finalMarketList = generateFinalListHTML(groupedObjectByShop);

  return finalMarketList;
};

const generateFinalListHTML = (obj) => {
  let strFinalList = "";
  Object.entries(sortAscendingObjectByKey(obj)).map(([key, value]) => {
    strFinalList = strFinalList.concat(
      `
      <div id="card">
        <table class="table">
          <thead>
            <tr class="table-header-row">
              <td class="table-header-data">${key.toUpperCase()}</td>
            </tr>
          </thead>
          <tbody>
      `
    );

    sortAscendingListByProduct(value).forEach((item) => {
      strFinalList = strFinalList.concat(
        `
        <tr class="table-row">
          <td class="table-data rank-${item.rank}">${item.rank}º</td>
          <td class="table-data produto">${item.produto}</td>
          <td class="table-data tag-${item.rank}">
            ${
              item.rank === 1
                ? '<span class="material-icons">verified</span>'
                : ""
            }
          </td>
          <td class="table-data valor">${item.valor.toLocaleString("pt-br", {
            style: "decimal",
            minimumFractionDigits: 2,
          })}</td>
        </tr>
        `
      );
    });

    strFinalList = strFinalList.concat(
      `
          </tbody>
        </table>
      </div>
      `
    );
  });

  return strFinalList;
};

const groupByShop = (arr) => {
  return arr.reduce((result, currentValue) => {
    (result[currentValue.loja] = result[currentValue.loja] || []).push(
      currentValue
    );
    return result;
  }, {});
};

const groupByProduct = (arr) => {
  return arr.reduce((result, currentValue) => {
    (result[currentValue.produto] = result[currentValue.produto] || []).push(
      currentValue
    );
    return result;
  }, {});
};

const sortAscendingListByPrice = (arr) =>
  arr.sort((itemA, itemB) => itemA.valor - itemB.valor);

const sortAscendingListByProduct = (arr) =>
  arr.sort((itemA, itemB) => {
    const productA = itemA.produto.toUpperCase();
    const productB = itemB.produto.toUpperCase();
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
    if (index > 0 && item.valor > arr[index - 1].valor) {
      rank++;
    }
    item.rank = rank;
    return item;
  });
};

const checkbox = document.getElementById("checkbox");

const changeTheme = () => {
  document.body.classList.toggle("dark");
};

const loadTheme = () => {
  const isDarkMode = localStorage.getItem("dark");

  if (isDarkMode) {
    changeTheme();
  }
};

loadTheme();

checkbox.addEventListener("change", () => {
  changeTheme();

  //salva ou remove o dark mode]
  localStorage.removeItem("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("dark", 1);
  }
});

$("#data").html(database.data);

// utilizando api
// let url =
//   "https://api.sheety.co/d3a0bd0987cadf495617032c2aa34290/marketList/list";
// fetch(url)
//   .then((response) => response.json())
//   .then((response) => {
//     $("#json").html(getFinalMarketList(response.list));
//   });

// utilizando arquivo local db.json
$("#lista").html(getFinalMarketList(database.lista));
