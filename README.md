# JPNS1611 Hiragana Dictation App

一份根据 JPNS1611 Week 1–4 tutorial slides 整理的离线平假名听写练习。

## 使用

直接打开 [`jpns1611-hiragana-dictation.html`](./jpns1611-hiragana-dictation.html)，不需要安装服务器或依赖。

- 默认使用鼠标／触控笔手写，可切换为键盘输入。
- 浏览器日语语音负责朗读题目。
- 题库包括 93 个 Script 高频词、71 个对话词汇、76 个句子、59 个数字表达和 14 个补充词。
- 点“写好了，看答案”即记为已完成；可进一步标记“已掌握”或“重点复习”。
- 每列最多显示 15 条答题记录，点击记录可返回对应题目。
- 进度自动保存在浏览器 `localStorage`，下次从同一浏览器、同一文件地址打开时会恢复。
- 支持按 Week 筛选、错题复习、随机洗牌、CSV 导出和打印。

如果浏览器没有日语发音，请在操作系统中安装日语语音包。无痕／隐私浏览模式可能不会保留进度。

## 文件

- `index.html`：GitHub Pages 入口。
- `jpns1611-hiragana-dictation.html`：单文件练习应用。
- `jpns1611-hiragana-dictation-data.csv`：完整数据清单。
- `jpns1611-hiragana-study-guide.html`：适合浏览和重新打印的总表。
- `jpns1611-hiragana-study-guide.pdf`：A4 复习总表。
- `tools/`：数据校验、CSV 和 PDF 总表生成脚本。

原始课程 slides 与本地 Poppler 二进制文件不会提交到仓库。

