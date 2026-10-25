<template>
  <div class="station-manage">
    <el-card shadow="never">
      <!-- 检索栏 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="工站编码">
          <el-input v-model="searchForm.code" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="工站名称">
          <el-input v-model="searchForm.name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="openDialog()">新增工站</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="code" label="工站编码" width="120" />
        <el-table-column prop="name" label="工站名称" width="150" />
        <el-table-column prop="lineArea" label="产线区域" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" sortable />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑工站' : '新增工站'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="工站编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入唯一编码" />
        </el-form-item>
        <el-form-item label="工站名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="产线区域" prop="lineArea">
          <el-select v-model="formData.lineArea" placeholder="请选择" style="width: 100%">
            <el-option label="A区" value="A" />
            <el-option label="B区" value="B" />
            <el-option label="C区" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" rows="3" placeholder="请输入备注（最多100字）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getStations, addStation, updateStation, deleteStation } from '../api/station'
import type { Station, StationQuery } from '../types/station'

// 检索与分页
const searchForm = reactive<StationQuery>({ code: '', name: '', status: undefined, page: 1, pageSize: 10 })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const tableData = ref<Station[]>([])
const loading = ref(false)

// 弹窗与表单
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive<Omit<Station, 'id' | 'createTime' | 'updateTime'>>({
  code: '', name: '', lineArea: '', status: 'active', remark: ''
})

const rules: FormRules = {
  code: [{ required: true, message: '请输入工站编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入工站名称', trigger: 'blur' }],
  lineArea: [{ required: true, message: '请选择产线区域', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getStations({ ...searchForm, page: pagination.page, pageSize: pagination.pageSize })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.code = ''
  searchForm.name = ''
  searchForm.status = undefined
  pagination.page = 1
  fetchData()
}

const openDialog = (row?: Station) => {
  if (row) {
    isEdit.value = true
    Object.assign(formData, row)
  } else {
    isEdit.value = false
    Object.assign(formData, { code: '', name: '', lineArea: '', status: 'active', remark: '' })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (isEdit.value && formData.id) {
      await updateStation(formData as Station)
      ElMessage.success('修改成功')
    } else {
      await addStation(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (err) {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row: Station) => {
  ElMessageBox.confirm(`确定要删除工站 "${row.name}" 吗？此操作不可恢复。`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(async () => {
      await deleteStation(row.id!)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

onMounted(fetchData)
</script>

<style scoped>
.station-manage { padding: 20px; }
.toolbar { margin-bottom: 16px; display: flex; justify-content: flex-end; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>