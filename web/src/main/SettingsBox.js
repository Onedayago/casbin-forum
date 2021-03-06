// Copyright 2020 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import * as Setting from "../Setting";
import Header from "./Header";
import Avatar from "../Avatar";
import {withRouter} from "react-router-dom";
import * as AccountBackend from "../backend/AccountBackend";
import * as MemberBackend from "../backend/MemberBackend";
import * as Tools from "./Tools";
import * as Conf from "../Conf";
import '../Reply.css';
import '../Settings.css';
import i18next from "i18next";

class SettingsBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      member: null,
      event: props.match.params.event,
      topics: [],
      username: "",
      form: {},
      avatar: null,
      showSuccess: false,
      Setting_LIST: [
        {label: "Profile", value: "profile"},
        {label: "Avatar", value: "avatar"},
      ]
    };
    if (this.state.event === undefined) {
      this.state.event = "profile";
    }
    if (this.state.event === "avatar") {
      const params = new URLSearchParams(this.props.location.search)
      this.state.showSuccess = params.get("success");
    }

    this.newUsername = this.newUsername.bind(this);
    this.postUsername = this.postUsername.bind(this);
  }

  componentDidMount() {
    this.initForm();
  }

  initForm() {
    if (this.state.event !== "profile") {
      return;
    }

    let form = this.state.form;
    form["website"] = this.props.account?.website;
    form["company"] = this.props.account?.company;
    form["bio"] = this.props.account?.bio;
    form["companyTitle"] = this.props.account?.companyTitle;
    form["tagline"] = this.props.account?.tagline;
    form["location"] = this.props.account?.location;
    this.setState({
      form: form,
    });
  }

  newUsername() {
    const params = new URLSearchParams(this.props.location.search);
    let email, method, addition, avatar, addition2;
    email = params.get("email");
    method = params.get("method");
    addition = params.get("addition");
    addition2 = params.get("addition2");
    avatar = params.get("avatar");
    return {
      username: this.state.username,
      email: email,
      method: method,
      addition: addition,
      addition2: addition2,
      avatar: avatar,
    }
  }

  postUsername() {
      const name = this.newUsername();
      AccountBackend.signup(name)
        .then((res) => {
            if (res.status === "ok") {
              Setting.showMessage("success", `Set username success`);
              window.location.href = '/';
            }else {
              Setting.showMessage("error", `Set username failed：${res.msg}`);
            }
          }
        )
        .catch(error => {
          Setting.showMessage("error", `Set username failed：${error}`);
        });
  }

  handelChange(e){
    this.setState({
      username: e.target.value
      });
  }

  updateFormField(key, value) {
    let form = this.state.form;
    form[key] = value;
    this.setState({
      form: form,
    });
  }

  publishInfoUpdate() {
    MemberBackend.updateMemberInfo(this.props.account?.id, this.state.form)
      .then((res) => {
        if (res.status === 'ok') {
          this.changeSuccess();
        } else {
          Setting.showMessage("error", res.msg);
        }
      });
  }

  handelChangeAvatar(event) {
    this.setState({
      avatar: event.target.files[0]
    });
  }

  uploadAvatar() {
    if (this.state.avatar === null) {
      return;
    }
    let redirectUrl = window.location.href.substring(0, window.location.href.lastIndexOf('?'));

    Tools.uploadAvatar(this.state.avatar, redirectUrl);
  }

  changeSuccess() {
    this.setState({
      showSuccess: !this.state.showSuccess
    });
  }

  renderSettingList(item){
    return (
          <a href={`/settings/${item.value}`} className={this.state.event === item.value ? "tab_current" : "tab"}>{i18next.t(`setting:${item.label}`)}</a>
      )
  }

  renderHeader() {
    return (
      <div className="box">
        <div className="page-content-header">
          <img src={Setting.getStatic("/static/img/settings.png")} width="64" alt="Settings" />
          <h2>{i18next.t("setting:Settings")}</h2>
        </div>
        <div className="cell">
          {
            this.state.Setting_LIST.map((item) => {
              return this.renderSettingList(item);
            })
          }
        </div>
        {
          this.state.showSuccess ?
            <div className="message" onClick={() => this.changeSuccess()}>
              <li className="fa fa-exclamation-triangle"></li>
              &nbsp;{" "}
              {this.state.event === "profile" ? i18next.t("setting:Settings have been successfully saved") : null}
              {this.state.event === "avatar" ? i18next.t("setting:New avatar set successfully") : null}
            </div> : null
        }
      </div>
    );
  }

  render() {
    const account = this.props.account;

    if (this.state.event === "username") {
      return (
        <div className="box">
          <div className="header">
            <a href="/">{Setting.getForumName()}</a>
            <span className="chevron">&nbsp;›&nbsp;</span>
            <a href="/settings">Settings</a> <span className="chevron">&nbsp;›&nbsp;</span> Set Username
          </div>
          <div className="cell">
            <div className="topic_content">
              Welcome to {Setting.getForumName()}, you just registered your {Setting.getForumName()} account through Google. Now please set a username here, you can only use half-width English letters and numbers. Other users can
              send you a message through @ your account name. The user name cannot be changed after setting.
            </div>
          </div>
          <div className="inner">
            <table cellPadding="5" cellSpacing="0" border="0" width="100%">
              <tr>
                <td width="120" align="right">Username</td>
                <td width="auto" align="left">
                  <input type="text" className="sl" name="username" onChange={this.handelChange.bind(this)} autoComplete="off"/></td>
              </tr>
              <tr>
                <td width="120" align="right"></td>
                <td width="auto" align="left"><input type="hidden"/>
                <input type="submit" className="super normal button" onClick={this.postUsername} value="save"/></td>
              </tr>
            </table>
          </div>
        </div>
      );
    }

    if (this.state.event === "avatar") {
      if (this.props.account !== undefined) {
        Setting.initOSSClient(this.props.account?.id);
      }
      return (
        <div>
          {this.renderHeader()}
          <div className="box" data-select2-id="11">
            <div className="cell">
              <table cellPadding="5" cellSpacing="0" border="0" width="100%">
                <tbody>
                <tr>
                  <td width="120" align="right">{i18next.t("setting:Current avatar")}</td>
                  <td width="auto" align="left">
                    <Avatar username={this.props.account?.id} avatar={this.props.account?.avatar} size={"large"} />{" "}&nbsp;{" "}
                    <Avatar username={this.props.account?.id} avatar={this.props.account?.avatar} />{" "}&nbsp;{" "}
                    <Avatar username={this.props.account?.id} avatar={this.props.account?.avatar} size={"small"} />
                  </td>
                </tr>
                <tr>
                  <td width="120" align="right">{i18next.t("setting:Choose a picture file")}</td>
                  <td width="auto" align="left"><input type="file" accept=".jpg,.gif,.png" onChange={(event) => this.handelChangeAvatar(event)} name="avatar" /></td>
                </tr>
                <tr>
                  <td width="120" align="right"></td>
                  <td width="auto" align="left"><span className="gray">{i18next.t("setting:Support PNG / JPG / GIF files within 2MB")}</span></td>
                </tr>
                <tr>
                  <td width="120" align="right"></td>
                  <td width="auto" align="left"><input type="hidden" name="once"/>
                    <input type="submit" className="super normal button" onClick={() => this.uploadAvatar()} value={i18next.t("setting:Upload")} />
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div class="inner markdown_body">
              <p>{i18next.t("setting:Rules and recommendations on avatars")}</p>
              <ul>
                <li>{Setting.getForumName()}{" "}{i18next.t("setting:It is forbidden to use any vulgar or sensitive pictures as avatars")}</li>
                <li>{i18next.t("setting:If you are a man, please do not use a woman’s photo as your avatar, as this may mislead other members")}</li>
                <li>{Setting.getForumName()}{" "}{i18next.t("setting:It is recommended that you do not use real person photos as avatars, even photos of yourself. The use of other people’s photos is prohibited")}</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        {this.renderHeader()}
        <div className="inner box" data-select2-id="11">
          <table cellPadding="5" cellSpacing="0" border="0" width="100%" data-select2-id="9">
            <tbody data-select2-id="8">
            <tr>
              <td width="120" align="right">
                <Avatar username={account?.id} size="small" avatar={account?.avatar} />
              </td>
              <td width="auto" align="left">
                {Setting.getForumName()} {i18next.t("member:No.")} {account?.no} {i18next.t("member:member")}
              </td>
            </tr>
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Username")}
              </td>
              <td width="auto" align="left">
                {account?.id}
              </td>
            </tr>
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Phone")}
              </td>
              {
                account?.phone.length === 0 ?
                  <td width="auto" align="left">
                    <span className="negative">
                      {i18next.t("setting:Phone not verified")}
                    </span>
                  </td> :
                  <td width="auto" align="left">
                    <code>
                      {account?.areaCode}{" "}{account?.phone}
                    </code>
                  </td>
              }
            </tr>
            {
              account?.phoneVerifiedTime.length !== 0 ?
                <tr>
                  <td width="120" align="right">
                    {i18next.t("setting:Phone Verification")}
                  </td>
                  <td width="auto" align="left">
                    <span className="green">
                      {i18next.t("setting:Verified on")}{" "}{Setting.getFormattedDate(account?.phoneVerifiedTime)}
                    </span>
                  </td>
                </tr> :
                <tr>
                  <td width="120" align="right" />
                  <td width="auto" align="left">
                    <a href="/settings/phone">
                      {i18next.t("setting:Modify Phone")}
                    </a>
                  </td>
                </tr>
            }
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Email")}
              </td>
              {
                account?.email.length === 0 ?
                  <td width="auto" align="left">
                    <span className="negative">
                      {i18next.t("setting:Email not verified")}
                    </span>
                  </td> :
                  <td width="auto" align="left">
                    <code>
                      {account?.email}
                    </code>
                  </td>
              }
            </tr>
            {
              account?.emailVerifiedTime.length !== 0 ?
                  <tr>
                    <td width="120" align="right">
                      {i18next.t("setting:Email Verification")}
                    </td>
                    <td width="auto" align="left">
                      <span className="green">
                        {i18next.t("setting:Verified on")}{" "}{Setting.getFormattedDate(account?.emailVerifiedTime)}
                      </span>
                    </td>
                </tr> :
                <tr>
                  <td width="120" align="right" />
                  <td width="auto" align="left">
                    <a href="/settings/email">
                      {i18next.t("setting:Modify Email")}
                    </a>
                  </td>
                </tr>
            }
            {
              Conf.GoogleClientId !== "" ?
                <tr>
                  <td width="120" align="right">
                    Google
                  </td>
                  {
                    account?.googleAccount === "" ?
                      <td width="auto" align="left">
                        <a onClick={() => Setting.getGoogleAuthCode("link")} href="javascript:void(0)">
                          {i18next.t("setting:Link with GoogleAccount")}
                        </a>
                      </td> :
                      <td width="auto" align="left">
                        <code>
                          {account?.googleAccount}
                        </code>
                      </td>
                  }
                </tr> : null
            }
            {
              account?.googleAccount === "" ? null :
                <tr>
                  <td width="120" align="right" />
                  <td width="auto" align="left">
                    <a href="/settings/google">
                      {i18next.t("setting:Modify GoogleAccount")}
                    </a>
                  </td>
                </tr>
            }
            {
              Conf.GithubClientId !== "" ?
                <tr>
                  <td width="120" align="right">
                    Github
                  </td>
                  {
                    account?.githubAccount === "" ?
                      <td width="auto" align="left">
                        <a onClick={() => Setting.getGithubAuthCode("link")} href="javascript:void(0)">
                          {i18next.t("setting:Link with GithubAccount")}
                        </a>
                      </td> :
                      <td width="auto" align="left">
                        <code>
                          {account?.githubAccount}
                        </code>
                      </td>
                  }
                </tr> : null
            }
            {
              account?.githubAccount === "" ? null :
                <tr>
                  <td width="120" align="right" />
                  <td width="auto" align="left">
                    <a href="/settings/github">
                      {i18next.t("setting:Modify GithubAccount")}
                    </a>
                  </td>
                </tr>
            }
            {
              Conf.WechatClientId !== "" ?
                <tr>
                  <td width="120" align="right">
                    {i18next.t("setting:WeChat")}
                  </td>
                  {
                    account?.weChatAccount === "" ?
                      <td width="auto" align="left">
                        <a href="/settings/wechat">
                          {i18next.t("setting:Link with WeChat")}
                        </a>
                      </td> :
                      <td width="auto" align="left">
                        <code>
                          {account?.weChatAccount}
                        </code>
                      </td>
                  }
                </tr> : null
            }
            {
              account?.weChatAccount === "" ? null :
                <tr>
                  <td width="120" align="right" />
                  <td width="auto" align="left">
                    <a href="/settings/weChat">
                      {i18next.t("setting:Modify WeChat")}
                    </a>
                  </td>
                </tr>
            }
            {
              Conf.QQClientId !== "" ?
                <tr>
                  <td width="120" align="right">
                    QQ
                  </td>
                  {
                    account?.qqAccount === "" ?
                      <td width="auto" align="left">
                        <a onClick={() => Setting.getQQAuthCode("link")} href="javascript:void(0)">
                          {i18next.t("setting:Link with QQAccount")}
                        </a>
                      </td> :
                      <td width="auto" align="left">
                        <code>
                          {account?.qqAccount}
                        </code>
                      </td>
                  }
                </tr> : null
            }
            {
              account?.qqVerifiedTime.length !== 0 ?
                <tr>
                  <td width="120" align="right">
                    {i18next.t("setting:QQ Verification")}
                  </td>
                  <td width="auto" align="left">
                      <span className="green">
                        {i18next.t("setting:Verified on")}{" "}{Setting.getFormattedDate(account?.qqVerifiedTime)}
                      </span>
                  </td>
                </tr> : null
            }
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Website")}
              </td>
              <td width="auto" align="left">
                <input type="text" className="sl" name="website" defaultValue={account?.website} onChange={event => this.updateFormField("website", event.target.value)} autoComplete="off" />
              </td>
            </tr>
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Company")}
              </td>
              <td width="auto" align="left">
                <input type="text" className="sl" name="company" defaultValue={account?.company} maxLength="32" onChange={event => this.updateFormField("company", event.target.value)} autoComplete="off" />
              </td>
            </tr>
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Company title")}
              </td>
              <td width="auto" align="left">
                <input type="text" className="sl" name="companyTitle" defaultValue={account?.companyTitle} maxLength="32" onChange={event => this.updateFormField("companyTitle", event.target.value)} autoComplete="off" />
              </td>
            </tr>
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Location")}
              </td>
              <td width="auto" align="left">
                <input type="text" className="sl" name="location" defaultValue={account?.location} maxLength="32" onChange={event => this.updateFormField("location", event.target.value)} autoComplete="off" />
              </td>
            </tr>
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Tagline")}
              </td>
              <td width="auto" align="left">
                <input type="text" className="sl" name="tagline" defaultValue={account?.tagline} maxLength="32" onChange={event => this.updateFormField("tagline", event.target.value)} autoComplete="off" />
              </td>
            </tr>
            <tr>
              <td width="120" align="right">
                {i18next.t("setting:Bio")}
              </td>
              <td width="auto" align="left">
                <textarea className="ml" name="bio" defaultValue={account?.bio} onChange={event => this.updateFormField("bio", event.target.value)} />
              </td>
            </tr>
            <tr>
              <td width="120" align="right" />
              <td width="auto" align="left">
                <input type="hidden" value="26304" name="once" />
                <input type="submit" className="super normal button" value={i18next.t("setting:Save Settings")} onClick={this.publishInfoUpdate.bind(this)} />
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default withRouter(SettingsBox);
