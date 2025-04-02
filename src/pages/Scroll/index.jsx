// src/components/Scroll.js (假设路径)
import {
  getEthBalance,
  getTxCount,
  getZksEra,
  getZksLite,
  getZkSyncBridge,
  exportToExcel,
  calculateScore,
  getDebankValue,
  getScrollInfo,
  getScrollTx,
  getScrollERC20,
  getScrollBridge,
  getMonadInfo, // 新增
  getMonadTxCount, // 新增
} from "@utils";

// ... 其他导入保持不变 ...

function Scroll() {
  const [data, setData] = useState([]);
  // ... 其他状态保持不变 ...

  const handleRefresh = async () => {
    if (!selectedKeys.length) {
      notification.error({
        message: "错误",
        description: "请先选择要刷新的地址",
      }, 2);
      return;
    }
    setIsLoading(true);
    try {
      const limit = 2;
      let activePromises = 0;
      let promisesQueue = [];
      const newData = [...data];
      const processQueue = () => {
        while (activePromises < limit && promisesQueue.length > 0) {
          const promise = promisesQueue.shift();
          activePromises += 1;
          promise().finally(() => {
            activePromises -= 1;
            processQueue();
          });
        }
        if (promisesQueue.length > 0) {
          setTimeout(processQueue, 2500);
        }
      };
      for (let key of selectedKeys) {
        const index = newData.findIndex((item) => item.key === key);
        if (index !== -1) {
          const item = newData[index];
          // 现有逻辑保持不变，添加 Monad 数据获取
          promisesQueue.push(() => {
            item.monad_eth_balance = null;
            return getMonadInfo(item.address).then(({ balance }) => {
              item.monad_eth_balance = balance;
              setData([...newData]);
              localStorage.setItem("scroll_addresses", JSON.stringify(newData));
            });
          });
          promisesQueue.push(() => {
            item.monad_tx_amount = null;
            return getMonadTxCount(item.address).then((txCount) => {
              item.monad_tx_amount = txCount;
              setData([...newData]);
              localStorage.setItem("scroll_addresses", JSON.stringify(newData));
            });
          });
          // 其他现有网络的 promisesQueue 逻辑保持不变 ...
        }
      }
      processQueue();
    } catch (error) {
      notification.error({
        message: "错误",
        description: error.message,
      }, 2);
    } finally {
      setIsLoading(false);
      setSelectedKeys([]);
      message.success("刷新成功");
    }
  };

  const handleBatchOk = async () => {
    try {
      setBatchLoading(true);
      setIsBatchModalVisible(false);
      const values = await batchForm.validateFields();
      const addressLines = values.addresses.split("\n");
      const wallets = addressLines.map((line) => {
        const [address, name] = line.split(",");
        return { address: address.trim(), name: name ? name.trim() : "" };
      });
      const addresses = wallets.map((obj) => obj.address);
      const names = wallets.map((obj) => obj.name);
      setBatchLength(addresses.length);
      const newData = [...data];
      const limit = 3;
      let activePromises = 0;
      let promisesQueue = [];
      setBatchProgress(0);
      const processQueue = () => {
        while (promisesQueue.length > 0 && activePromises < limit) {
          const promise = promisesQueue.shift();
          activePromises += 1;
          promise().finally(() => {
            activePromises -= 1;
            processQueue();
          });
        }
      };

      for (let address of addresses) {
        address = address.trim();
        let note = names[addresses.indexOf(address)];
        if (address.length !== 42) {
          notification.error({
            message: "错误",
            description: "请输入正确的地址",
          });
          continue;
        }
        const index = newData.findIndex((item) => item.address === address);
        const item = index !== -1 ? newData[index] : {
          key: newData.length.toString(),
          address: address,
          name: note,
          eth_balance: null,
          eth_tx_amount: null,
          scroll_eth_balance: null,
          scroll_last_tx: null,
          scroll_tx_amount: null,
          scroll_usdt_balance: null,
          scroll_usdc_balance: null,
          dayActivity: null,
          weekActivity: null,
          monthActivity: null,
          l1Tol2Times: null,
          l1Tol2Amount: null,
          l2Tol1Times: null,
          l2Tol1Amount: null,
          contractActivity: null,
          totalFee: null,
          totalExchangeAmount: null,
          monad_eth_balance: null, // 新增
          monad_tx_amount: null, // 新增
        };
        if (index === -1) {
          newData.push(item);
        }
        // 现有逻辑保持不变，添加 Monad 数据获取
        promisesQueue.push(() =>
          getMonadInfo(address).then(({ balance }) => {
            item.monad_eth_balance = balance;
          })
        );
        promisesQueue.push(() =>
          getMonadTxCount(address).then((txCount) => {
            item.monad_tx_amount = txCount;
          })
        );
        // 其他现有网络的 promisesQueue 逻辑保持不变 ...
        promisesQueue.push(() => {
          return new Promise((resolve) => {
            setBatchProgress((
