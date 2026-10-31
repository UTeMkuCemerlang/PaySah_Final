# CPU OCR 扩展合成评估

运行时间 2026-10-31T17:14:57.415Z；tesseract.js@7.0.0 / labelled-receipt.v2 / sharp-rotate-grey-2000.v1。这是真实本地 CPU OCR，没有 GPU 或外部图片 API。原始文本、字段、候选、哈希、规则结果和环境见 [results.json](results.json)，逐图预期与图片见 [manifest](../../fixtures/ocr-expanded/manifest.json)，布局图片见上述 manifest。

## 范围与计分

36张，3布局×12案例／条件（7种原始案例，加正常单的模糊1.2、旋转4度、430px宽JPEG质量45、多金额、裁掉状态）。数据由团队代码生成，复用了相同虚构标识和固定英文标签；是相关的诊断集，未作独立留出或真实银行评估。字体依赖生成机器，现有PNG/JPEG与manifest哈希锁定本轮输入。图片仅供评估，不加入公开应用catalog，也不读取用户反馈。

每张计7字段，currency固定MYR不计分。多金额预期amount_sen=null，要求保留歧义；裁掉状态仍用完整原始字段计分，缺失会计错并应转复核。字段不一致不等于欺诈。

字段精确 224/252（88.9%）；整张7字段一致 27/36（75.0%）。OCR缺字段提示 10/36（27.8%）；存在字段错误但没有缺字段提示 2/36。规则需要Owner或阻断 30/36（83.3%），不是实际人工处理耗时。提取异常 0。

规则错误准入 0，Owner降为Cashier 0。该检查使用独立定义的两笔合成入账调用纯verify；每张场景独立、不累计分配，不写数据库，不执行批准或放货。“eligible”仍要求人员确认，不是到账事实或自动付款。0次错误准入也不能证明真实收据安全。

## 按布局

| 布局 | 精确字段 | 整张一致 | OCR复核提示 | 错误未提示 | 规则错误准入 | p50/p95 ms |
| --- | --- | --- | --- | --- | --- | --- |
| ledger | 75/84 | 9/12 | 3/12 | 1 | 0 | 268/678 |
| portrait | 76/84 | 9/12 | 3/12 | 1 | 0 | 280/484 |
| compact | 73/84 | 9/12 | 4/12 | 0 | 0 | 297/321 |

## 按条件

| 条件 | 样本 | 精确字段 | OCR复核提示 | 错误未提示 | 规则错误准入 |
| --- | --- | --- | --- | --- | --- |
| clear | 21 | 147/147 | 0 | 0 | 0 |
| blur | 3 | 21/21 | 0 | 0 | 0 |
| rotation | 3 | 14/21 | 1 | 2 | 0 |
| low_resolution | 3 | 7/21 | 3 | 0 | 0 |
| multiple_amounts | 3 | 21/21 | 3 | 0 | 0 |
| cropped_status | 3 | 14/21 | 3 | 0 | 0 |

## 按字段

| 字段 | 精确数 |
| --- | --- |
| amount_sen | 33/36 |
| bank_transaction_ref | 30/36 |
| customer_reference | 35/36 |
| recipient_account | 31/36 |
| occurred_at | 31/36 |
| status | 32/36 |
| document_type | 32/36 |

## 本机资源观测

win32/x64，Node v24.12.0，CPU 13th Gen Intel(R) Core(TM) i7-13650HX，逻辑CPU 20。首张含初始化 678ms；排除首张p50/p95 285/368ms。整次wall 10841ms，进程CPU 13079ms。采样进程RSS起始 99.0MiB，峰值 285.5MiB（392次采样，请求间隔25ms，可能漏过瞬时峰值；含本进程OCR线程，不含API／数据库／整机）。这些数字不能推导Replit最低规格、价格或持续并发性能；Linux云端同机API+worker资源验收仍NOT RUN。[Node指标定义](https://nodejs.org/docs/latest-v24.x/api/process.html#processmemoryusage)

## 逐图结果

| 图片 | 字段 | ms | OCR待复核 | 规则准入 | 错误字段 |
| --- | --- | --- | --- | --- | --- |
| ledger-normal | 7/7 | 678 | 无 | true | 无 |
| ledger-partial | 7/7 | 285 | 无 | false | 无 |
| ledger-wrong_account | 7/7 | 272 | 无 | false | 无 |
| ledger-scheduled | 7/7 | 268 | 无 | false | 无 |
| ledger-money_request | 7/7 | 259 | 无 | false | 无 |
| ledger-no_bank | 7/7 | 259 | 无 | false | 无 |
| ledger-high_value | 7/7 | 316 | 无 | true | 无 |
| ledger-normal_blur | 7/7 | 368 | 无 | true | 无 |
| ledger-normal_rotation | 5/7 | 253 | 无 | false | bank_transaction_ref, recipient_account |
| ledger-normal_low_resolution | 3/7 | 137 | amount_sen, bank_transaction_ref, recipient_account, occurred_at | false | amount_sen, bank_transaction_ref, recipient_account, occurred_at |
| ledger-normal_multiple_amounts | 7/7 | 323 | amount_sen | false | 无 |
| ledger-normal_cropped_status | 4/7 | 224 | occurred_at, status, document_type | false | occurred_at, status, document_type |
| portrait-normal | 7/7 | 278 | 无 | true | 无 |
| portrait-partial | 7/7 | 319 | 无 | false | 无 |
| portrait-wrong_account | 7/7 | 294 | 无 | false | 无 |
| portrait-scheduled | 7/7 | 306 | 无 | false | 无 |
| portrait-money_request | 7/7 | 280 | 无 | false | 无 |
| portrait-no_bank | 7/7 | 280 | 无 | false | 无 |
| portrait-high_value | 7/7 | 284 | 无 | true | 无 |
| portrait-normal_blur | 7/7 | 271 | 无 | true | 无 |
| portrait-normal_rotation | 5/7 | 300 | 无 | false | bank_transaction_ref, recipient_account |
| portrait-normal_low_resolution | 3/7 | 170 | bank_transaction_ref, recipient_account, occurred_at | false | amount_sen, bank_transaction_ref, recipient_account, occurred_at |
| portrait-normal_multiple_amounts | 7/7 | 484 | amount_sen | false | 无 |
| portrait-normal_cropped_status | 5/7 | 264 | status, document_type | false | status, document_type |
| compact-normal | 7/7 | 297 | 无 | true | 无 |
| compact-partial | 7/7 | 297 | 无 | false | 无 |
| compact-wrong_account | 7/7 | 304 | 无 | false | 无 |
| compact-scheduled | 7/7 | 321 | 无 | false | 无 |
| compact-money_request | 7/7 | 304 | 无 | false | 无 |
| compact-no_bank | 7/7 | 293 | 无 | false | 无 |
| compact-high_value | 7/7 | 298 | 无 | true | 无 |
| compact-normal_blur | 7/7 | 296 | 无 | true | 无 |
| compact-normal_rotation | 4/7 | 281 | occurred_at | false | bank_transaction_ref, recipient_account, occurred_at |
| compact-normal_low_resolution | 1/7 | 149 | amount_sen, bank_transaction_ref, occurred_at, status, document_type | false | amount_sen, bank_transaction_ref, customer_reference, occurred_at, status, document_type |
| compact-normal_multiple_amounts | 7/7 | 318 | amount_sen | false | 无 |
| compact-normal_cropped_status | 5/7 | 258 | status, document_type | false | status, document_type |

复现：在Node24安装锁定依赖后执行 npm run fixtures:ocr-expanded（可选，会按本机字体重生成）与 npm run eval:ocr-expanded。不重生成即可按已保存图片／哈希重跑。普通 npm test 不重跑36图资源评估。低准确率如实报告；脚本仅在输入／执行异常或规则错误准入／角色降级时非零退出，不以观察到低准确率删除样本或改写预期。真实商家收益、真实截图、并发、云端和跨平台评估仍未运行。

数据版本 synthetic-layouts.v2。预期应阻断 21 张，错误准入 0；预期可核实 15 张，其中被阻断 6 张；准入但字段不一致 0 张。这是本轮原始诊断结果；未包含历史分析附件。
