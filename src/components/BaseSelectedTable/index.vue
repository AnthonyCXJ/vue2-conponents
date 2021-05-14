<template>
  <div class="base-selected-table-box">
    <!-- 搜索插槽 -->
    <solt name="search"></solt>

    <div class="table-box">
      <el-table
        border
        :data="tableData"
        @select="selectChange"
        @select-all="selectChange"
        ref="tableRef"
        v-loading="loading"
      >
        <!-- 单选 -->
        <el-table-column
          width="50"
          align="center"
          v-if="isRadio"
          class-name="is-radio-column"
        >
          <template slot-scope="scope">
            <el-radio
              :label="scope.row[keyLabel]"
              :change="selectRadioChange(scope.row)"
              v-model="selectedRadio"
            ></el-radio>
          </template>
        </el-table-column>

        <!-- 多选 -->
        <el-table-column
          :selectable="isSelectable"
          type="selection"
          v-else
        ></el-table-column>

        <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :label="column.label"
          :width="column.width"
          :formatter="column.formatter"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <!-- 自定义列 -->
            <!-- 插槽传给父组件，需要一层引用才能访问，比如传出去的row、需要一个对象.row才能访问到 -->
            <slot
              :name="column.slot"
              :row="scope.row"
              v-if="column.slot"
            ></slot>
            <!-- 普通列 -->
            <span v-else>{{ scope.row[column.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="currentChange"
        layout="total, prev, pager, next"
      ></el-pagination>
    </div>
  </div>

  <!-- 调用方法 -->
  <!-- <base-selected-table
    ref="BaseSelectedTable"
    :loading="loading"
    :selected-data="selectedData"
    :table-data="tableData"
    :page-size="pageSize"
    :total="total"
    :columns="columns"
    key-label="id"
    :is-radio="isRadio"
    @close="close"
    @confirm="confirm"
    @getData="getData"
  >
    <div slot="search">
    </div>
  </base-selected-table> -->
</template>

<script>
export default {
  name: 'BaseSelectedTable',
  props: {
    placeholder: {
      type: String,
      default: '请输入',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    pageSize: {
      type: Number,
      default: 5,
    },
    total: {
      type: Number,
      default: 0,
    },
    // 原始选中的数据，灰显
    selectedData: {
      type: Array,
      default: () => [],
    },
    // 键值
    keyLable: {
      type: String,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    isRadio: {
      type: Boolean,
      default: true,
    },
    // 转换函数
    convertBeforeConfirm: {
      type: Function,
    },
  },
  created() {},
  data() {
    return {
      searchValue: '',
      currentPage: 1,
      tplSelectedList: [],
      selectedRadio: '',
      selectedRadioItem: {},
    }
  },
  computed: {
    allSelectedList() {
      return [...this.selectedData, ...this.tplSelectedList]
    },
  },
  watch: {
    tableData() {
      const { allSelectedList } = this
      if (allSelectedList && allSelectedList.length > 0) {
        this.displaySelections()
      }
    },
  },
  methods: {
    queryData() {
      const { searchValue, currentPage, pageSize } = this
      this.$emit('getData', {
        searchValue,
        currentPage,
        pageSize,
      })
    },
    currentChange(currentPage) {
      this.currentPage = currentPage
      this.queryData()
    },
    // 标志
    isSelectable(row, index) {
      return !row.isSelected
    },
    handleCOnfirm() {
      // 当为单选时，返回一个对象，多选返回一个数组
      if (this.isRadio) {
        if (this.selectedRadioItem && this.selectedRadioItem[this.keyLable]) {
          this.$emit('confirm', [this.selectedRadioItem])
        } else {
          this.$emit('confirm', false)
        }
      } else {
        const { tplSelectedList } = this
        let newSelected = this.convertBeforeConfirm
          ? tplSelectedList.map(this.convertBeforeConfirm)
          : tplSelectedList
        this.$emit('confirm', newSelected)
      }
    },

    handleCancel() {
      this.$emit('close')
    },
    // 单选
    selectRadioChange(row) {
      this.selectedRadioItem = row
    },
    // 多选
    selectChange(selection, row) {
      let { tplSelectedList, keyLable, tableData } = this
      if (row) {
        let curRowIndex = tplSelectedList.findIndex(
          (tpl) => tpl[keyLable] === row[keyLable]
        )

        let isDelete =
          curRowIndex > -1 &&
          !Selection.some((s) => s[keyLable] === row[keyLable])

        if (isDelete) {
          tplSelectedList.splice(curRowIndex, 1)
        }
      } else {
        for (let row of tableData) {
          let curRow = Selection.find((s) => s[keyLable] === row[keyLable])
          if (!curRow) {
            let curRowIndex = tplSelectedList.findIndex(
              (tpl) => tpl[keyLable] === row[keyLable]
            )
            curRowIndex > -1 && tplSelectedList.splice(curRowIndex, 1)
          }
        }
      }

      let filterSelection = selection.filter(
        (item) =>
          !item.isSelectable &&
          !tplSelectedList.some((tpl) => tpl[keyLable] === item[keyLable])
      )
      tplSelectedList.push(...filterSelection)
    },
    // 回显
    displaySelections() {
      const { tableData, allSelectedList, keyLable } = this
      const filterData = tableData.filter((row) =>
        allSelectedList.some((tRow) => tRow[keyLable] === row[keyLable])
      )

      if (filterData && filterData.length > 0) {
        Promise.resolve().then((r) => {
          filterData.forEach((row) => {
            this.$refs.tableRef.toggleRowSelection(row, true)
          })
        })
      }
    },
  },
}
</script>

<style>
</style>