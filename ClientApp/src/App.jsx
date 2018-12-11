import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { Layout, Icon } from 'antd';
import styled from 'styled-components';
import Ranking from './components/Ranking';

const { Header, Content, Footer } = Layout;

const CustomHeader = styled(Header)`
  color: white;
  background-color: rgb(0, 0, 0, 0.7);
  padding: 0 4em;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
`;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Layout>
        <CustomHeader>
          <div>某科学的 Bangumi 动画排名</div>
          <div>
            <Icon type="question-circle" theme="filled" />
          </div>
        </CustomHeader>
        <Content>
          <Ranking />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          © 2018 Ronnie Wang, all rights reserved. Powered by .Net Core and
          React on Linux.
        </Footer>
      </Layout>
    );
  }
}

export default hot(module)(App);
