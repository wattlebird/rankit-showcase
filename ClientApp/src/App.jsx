import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { Layout, Icon, Button } from 'antd';
import styled from 'styled-components';
import backgroundImg from 'assets/background2.jpg'
import Ranking from './components/Ranking';

const { Header, Content, Footer } = Layout;

const CustomHeader = styled(Header)`
  color: rgba(255, 255, 255, 0.8);
  background-color: transparent;
  padding: 0 4em;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
`;

const TitleBox = styled.div`
  margin: 8em auto;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
`;

const Title = styled.div`
  font-size: 36px;
  margin-bottom: 1em;
`;

const TitleNote = styled.span`
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  font-size: 24px;
  display: flex;
  justify-content: center;
`;

const SubTitleButton = styled(Button)`
  margin-left: 8px;
  &.ant-btn {
    border-radius: 0;
  }
  :first-child {
    margin-left: 0;
  }
`;

const CustomFooter = styled(Footer)`
  &.ant-layout-footer {
    text-align: center;
    background-color: #020111;
    color: rgba(255, 255, 255, 0.8);
  }
`;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Layout style={{background: `url(${backgroundImg}) no-repeat scroll`, backgroundColor: '#020111', minHeight: '100vh'}}>
        <CustomHeader>
          <div>Bangumi Research</div>
          <div>
            <Icon type="question-circle" theme="filled" />
          </div>
        </CustomHeader>
        <Content>
          <TitleBox>
            <Title>某科学的 Bangumi 动画排名<TitleNote> v0.999</TitleNote></Title>
            <ButtonGroup>
              <SubTitleButton>使用说明</SubTitleButton>
              <SubTitleButton href="https://github.com/wattlebird/rankit-showcase" target="_blank">GitHub 页面</SubTitleButton>
            </ButtonGroup>
          </TitleBox>
          <Ranking />
        </Content>
        <CustomFooter>
          © 2018 Ronnie Wang, all rights reserved. Powered by React and .Net Core on Linux.
        </CustomFooter>
      </Layout>
    );
  }
}

export default hot(module)(App);
