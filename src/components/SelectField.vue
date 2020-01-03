<template>
  <div class="sidebar-control">
    <div class="control-header">
      <div class="control-label">
        {{ label }}
      </div>
    </div>
    <div class="control-header">
      <select
        v-model="selectedOption"
        class="custom-select custom-select-sm custom-select-input"
        @change="onInput">
        <option
          v-for="(item, index) in options"
          :key="index"
          :value="item.value">
          {{ item.text }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectField',
  props: {
    label: {
      type: String,
      default: 'Label'
    },
    value: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => ([])
    }
  },
  data: () => ({
    selectedOption: ''
  }),
  watch: {
    value: function (newValue) {
      this.selectedOption = newValue
    }
  },
  mounted () {
    this.selectedOption = this.value
  },
  methods: {
    onInput ($event) {
      this.$emit('input', $event.target.value)
      this.selectedOption = $event.target.value
    }
  }
}
</script>
