import React, { Component } from 'react';

//修改表头
class EditHeader extends Component<{ value: string }> {
  render() {
    const { value } = this.props
    return <span>{value}</span>
  }
}

export default EditHeader