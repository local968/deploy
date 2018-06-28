import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from "./styles.module.css";
import warnIcon from "./fail.svg";
import config from "../../config.js";
import { Checkbox, Icon } from 'antd';

@inject('userStore')
@observer
export default class SignUp extends Component{
    componentWillMount() {
        if(!config.openResiger){
            return this.props.history.push("/")
        }
    }

    state = {
        email: '',
        password: '',
        confirmPassword: '',
        warning: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        showLicense: false
    }

    onChangeEmail = (e) => {
        this.setState({
            email: e.target.value.toLowerCase()
        })
    }

    onChangePassword = (e) => {
        this.setState({
            password: e.target.value
        })
    }

    onChangeConfirmPassword = (e) => {
        this.setState({
            confirmPassword: e.target.value
        })
    }

    register = () => {
        const {email, password, confirmPassword, warning} = this.state;
        if(!email){
            warning.email = "Enter your email";
        }else if(!new RegExp(/^[a-zA-Z0-9_-]+(\.([a-zA-Z0-9_-])+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/).test(email)){
            warning.email = "Enter a vaild emial address";
        }else {
            warning.email = "";
        }

        if(!password){
            warning.password = "Enter your password";
        }else{
            warning.password = "";
        }

        if(!confirmPassword || confirmPassword !== password){
            warning.confirmPassword = "passwords not match";
        }else{
            warning.confirmPassword = "";
        }

        if(warning.email || warning.password || warning.confirmPassword){
            return this.setState({
                warning: warning
            })
        }

        this.props.userStore.register({email, password})
    }

    login = () => {
        this.props.history.push("/")
    }

    show = () => {
        this.setState({
            showLicense: true
        })
    }

    hide = () => {
        this.setState({
            showLicense: false
        })
    }

    render() {
        return (this.state.showLicense?
        <License back={this.hide}/>:
        <div className={styles.signup}>
            <div className={styles.title}><span>Sign Up</span></div>
            <div className={styles.row}>
                <div className={styles.warning}>{this.state.warning.email && <span><img src={warnIcon} alt='warning' />{this.state.warning.email}</span>}</div>
                <input type="text" placeholder="Email Address" value={this.state.email} onChange={this.onChangeEmail}/>
            </div>
            <div className={styles.row}>
                <div className={styles.warning}>{this.state.warning.password && <span><img src={warnIcon} alt='warning' />{this.state.warning.password}</span>}</div>
                <input type="password" placeholder="Set a Password" value={this.state.password} onChange={this.onChangePassword}/>
            </div>
            <div className={styles.row}>
                <div className={styles.warning}>{this.state.warning.confirmPassword && <span><img src={warnIcon} alt='warning' />{this.state.warning.confirmPassword}</span>}</div>
                <input type="password" placeholder="Confirm Password" value={this.state.confirmPassword} onChange={this.onChangeConfirmPassword}/>
            </div>
            <div className={styles.text}><span>By clicking Sign Up,you agree to our&nbsp;<span className={styles.bold} onClick={this.show}>End User License Agreement</span></span></div>
            <div className={styles.buttonRow}>
                <button className={styles.button} onClick={this.register}>
                    <span>Sign Up</span>
                </button>
                <div className={styles.hasAccount} onClick={this.login}><span>Already have an account</span></div>
            </div>
        </div>)
    }
}

class License extends Component{
    state = {
        language: 'EN'
    }

    onChange = (e) => {
        this.setState({
            language: e.target.checked ? 'CN' : 'EN'
        })
    }

    getContent = () => {
        return this.state.language==='EN'?
        <div className={styles.content}>
            <h5>Version 1.0</h5>
            <h5>Effective Date:1/1/2018</h5>
            <h5>Last Updated Date:5/1/2018</h5>
            <h5> </h5>
            <p>PLEASE READ THIS END USER LICENSE AGREEMENT (THE “EULA”) CAREFULLY.  THE WEBSITES (“WEBSITE”), PRODUCTS, AND SERVICES OF R2.ai, INC. (“R2.ai”), ITS AFFILIATES OR AGENTS AND THE INFORMATION THEREIN ARE CONTROLLED BY R2.ai. COLLECTIVELY, R2.ai’s WEBSITES, PRODUCTS AND SERVICES ARE REFERRED TO HEREIN AS THE “SERVICES”. THIS EULA GOVERNS THE USE OF THE SERVICES, WHETHER YOU ARE USING AND DOWNLOADING OR INSTALLING SOFTWARE, OR ACCESSING AN ONLINE PLATFORM, AND APPLY TO ALL USERS ACCESSING OR USING THE SERVICES IN ANY WAY (“USERS”), INCLUDING USING THE SERVICES AND RESOURCES AVAILABLE OR ENABLED VIA THE WEBSITE.  BY CLICKING ON THE “I ACCEPT” BUTTON, COMPLETING THE REGISTRATION PROCESS, AND/OR BROWSING THE WEBSITE, DOWNLOADING OR INSTALLING ANY R2.ai SOFTWARE, OR DOWNLOADING R2.ai’S MOBILE APPLICATION (THE “APPLICATION”), YOU REPRESENT THAT (1) YOU HAVE READ, UNDERSTAND, AND AGREE TO BE BOUND BY THE EULA, (2) YOU ARE OF LEGAL AGE TO FORM A BINDING CONTRACT WITH R2.ai, AND (3) YOU HAVE THE AUTHORITY TO ENTER INTO THE EULA PERSONALLY OR ON BEHALF OF YOUR EMPLOYER OR THE ENTITY YOU HAVE NAMED AS THE USER, AND TO BIND THAT ENTITY TO THE EULA.  THE TERM “YOU” REFERS TO THE INDIVIDUAL OR LEGAL ENTITY, AS APPLICABLE, IDENTIFIED AS THE USER WHEN YOU REGISTERED ON THE WEBSITE.  IF YOU DO NOT AGREE TO BE BOUND BY THE EULA, YOU MAY NOT ACCESS OR USE THE WEBSITE, APPLICATION OR THE SERVICES.</p>
            <p>Your use of, and participation in, certain Services may be subject to additional terms (“Supplemental Terms”) and such Supplemental Terms will either be listed in the EULA or will be presented to you for your acceptance when you sign up to use the supplemental Service.  If the EULA are inconsistent with the Supplemental Terms, the Supplemental Terms shall control with respect to such Service.  The EULA and any applicable Supplemental Terms are referred to herein as the “Agreement”.</p>
            <p>PLEASE NOTE THAT THE AGREEMENT IS SUBJECT TO CHANGE BY R2.ai IN ITS SOLE DISCRETION AT ANY TIME.  When changes are made, R2.ai will make a new copy of the EULA available at the Website and within the Application and any new Supplemental Terms will be made available from within, or through, the affected Service on the Website or within the Application.  We will also update the “Last Updated” date at the top of the EULA.  If we make any material changes, and you have registered with us to create an Account (as defined in Section 2.1 below) we will also send an e-mail to you at the last e-mail address you provided to us pursuant to the Agreement.  Any changes to the Agreement will be effective immediately for new Users of the Website, the Application and/ or Services and will be effective thirty (30) days after posting notice of such changes on the Website for existing Users, provided that any material changes shall be effective for Users who have an Account with us upon the earlier of thirty (30) days after posting notice of such changes on the Website or thirty (30) days after dispatch of an e-mail notice of such changes to Registered Users (defined in Section 2.1 below).  R2.ai may require you to provide consent to the updated Agreement in a specified manner before further use of the Website, the Application and/ or the Services is permitted.  If you do not agree to any change(s) after receiving a notice of such change(s), you shall stop using the Website, the Application and/or the Services.  Otherwise, your continued use of the Website, the Application and/or Services constitutes your acceptance of such change(s).  PLEASE REGULARLY CHECK THE WEBSITE TO VIEW THE THEN-CURRENT AGREEMENT.</p>
            <p>1.Use of the Services and R2.ai Properties. The Application, the Software, the Website, the Services, and the information and content available on the Website and in the Application and the Services (as these terms are defined herein) (collectively, the “R2.ai Properties”) are protected by copyright laws throughout the world.  Subject to the Agreement, R2.ai grants you a limited license to reproduce portions of R2.ai Properties, in the Territory, for the sole purpose of using the Services for your personal or internal business purposes. Unless otherwise specified by R2.ai in a separate license, your right to use any R2.ai Properties is subject to the Agreement. “Territory” is limited to the United States.</p>
            <p>1.1Application License.  Subject to your compliance with the Agreement, R2.ai grants you a limited non-exclusive, non-transferable, non-sublicensable, revocable license to download, install and use a copy of the Application on a single mobile device or computer that you own or control and to run such copy of the Application, in the Territory, solely for your own personal or internal business purposes. Furthermore, with respect to any Application accessed through or downloaded from the Apple App Store (an “App Store Sourced Application”), you will only use the App Store Sourced Application (i) on an Apple-branded product that runs the iOS (Apple’s proprietary operating system) and (ii) as permitted by the “Usage Rules” set forth in the Apple App Store Agreement of Service. </p>
            <p>1.2R2.ai Software. R2.ai has developed an artificial intelligence platform (the “R2.ai Platform”) that is designed to help businesses analyze data and create business insights using custom-developed artificial intelligence models. Use of the R2.ai Platform and any other software and associated documentation, other than the Application, that is made available via the Website or the Services (“Software”) is governed by the license agreement expressly stated on the Website page(s) accompanying the Software. These license terms may be posted with the Software downloads or at the Website page where the Software can be accessed.  You shall not use, download or install any Software that is accompanied by or includes a license agreement unless you agree to the terms of such license agreement.  At no time will Company provide you with any tangible copy of our Software.  Company shall deliver access to the Software via electronic transfer or download and shall not use or deliver any tangible media in connection with the (a) delivery, installation, updating or problem resolution of any Software (including any new releases); or (b) delivery, correction or updating of documentation.  For the purposes of this section tangible media shall include, but not be limited to, any tape disk, compact disk, card, flash drive, or any other comparable physical medium.  Unless the accompanying license agreement expressly allows otherwise, any copying or redistribution of the Software is prohibited, including any copying or redistribution of the Software to any other server or location, or redistribution or use on a service bureau basis.  If there is any conflict between the Agreement and the license agreement, the license agreement shall take precedence in relation to that Software (except as provided in the following sentence). If the Software is a pre-release version, then, notwithstanding anything to the contrary included within an accompanying license agreement, you are not permitted to use or otherwise rely on the Software for any commercial or production purposes.  If no license agreement accompanies use of the Software, use of the Software will be governed by the Agreement. At no time will R2.ai provide you with any tangible copy of our Software. Subject to your compliance with the Agreement, R2.ai grants you a non-assignable, non-transferable, non-sublicensable, revocable non-exclusive license to use the Software, in the Territory, for the sole purpose of enabling you to use the Services in the manner permitted by the Agreement.    </p>
            <p>1.3Updates.  You understand that R2.ai Properties are evolving.  As a result, R2.ai may require you to accept updates to R2.ai Properties that you have installed on your computer or mobile device. You acknowledge and agree that R2.ai may update R2.ai Properties with or without notifying you.  You may need to update third-party software from time to time in order to use R2.ai Properties.</p>
            <p>1.4Certain Restrictions.  The rights granted to you in the Agreement are subject to the following restrictions: (a) you shall not license, sell, rent, lease, transfer, assign, reproduce, distribute, host or otherwise commercially exploit R2.ai Properties or any portion of R2.ai Properties, including the Website,  (b) you shall not frame or utilize framing techniques to enclose any trademark, logo, or other R2.ai Properties (including images, text, page layout or form) of R2.ai; (c) you shall not use any metatags or other “hidden text” using R2.ai’s name or trademarks; (d) you shall not modify, translate, adapt, merge, make derivative works of, disassemble, decompile, reverse compile or reverse engineer any part of R2.ai Properties except to the extent the foregoing restrictions are expressly prohibited by applicable law; (e) you shall not use any manual or automated software, devices or other processes (including but not limited to spiders, robots, scrapers, crawlers, avatars, data mining tools or the like) to “scrape” or download data from any web pages contained in the Website (except that we grant the operators of public search engines revocable permission to use spiders to copy materials from the Website for the sole purpose of and solely to the extent necessary for creating publicly available searchable indices of the materials, but not caches or archives of such materials); (f) you shall not access R2.ai Properties in order to build a similar or competitive website, application or service; (g) except as expressly stated herein, no part of R2.ai Properties may be copied, reproduced, distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means; and (h) you shall not remove or destroy any copyright notices or other proprietary markings contained on or in R2.ai Properties. Any future release, update or other addition to R2.ai Properties shall be subject to the Agreement.  R2.ai, its suppliers and service providers reserve all rights not granted in the Agreement. Any unauthorized use of R2.ai Properties terminates the licenses granted by R2.ai pursuant to the Agreement.</p>
            <p>1.5Third-Party Materials.  As a part of R2.ai Properties, you may have access to materials that are hosted by another party.  You agree that it is impossible for R2.ai to monitor such materials and that you access these materials at your own risk.</p>
            <p>2.Registration.</p>
            <p>2.1Registering Your Account.  In order to access certain features of R2.ai Properties you may be required to become a Registered User.  For purposes of the Agreement, a “Registered User” is a User who has registered an account on the Services (“Account”) by using the access credentials provided to such User by such User’s employer.</p>
            <p>2.2Registration Data.  In registering an account on the Website, you agree to (1) provide true, accurate, current and complete information about yourself as prompted by the registration form (the “Registration Data”); and (2) maintain and promptly update the Registration Data to keep it true, accurate, current and complete.  You represent that you are (1) at least eighteen (18) years old; (2) of legal age to form a binding contract; and (3) not a person barred from using R2.ai Properties under the laws of the United States, your place of residence or any other applicable jurisdiction.  You are responsible for all activities that occur under your Account.   You agree that you shall monitor your Account to restrict use by minors, and you will accept full responsibility for any unauthorized use of R2.ai Properties by minors.  You may not share your Account or password with anyone, and you agree to (1) notify R2.ai immediately of any unauthorized use of your password or any other breach of security; and (2) exit from your Account at the end of each session.  If you provide any information that is untrue, inaccurate, not current or incomplete, or R2.ai has reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete, R2.ai has the right to suspend or terminate your Account and refuse any and all current or future use of R2.ai Properties (or any portion thereof).  You agree not to create an Account using a false identity or information, or on behalf of someone other than yourself.  You agree that you shall not have more than one Account at any given time.  R2.ai reserves the right to remove or reclaim any usernames at any time and for any reason, including but not limited to, claims by a third party that a username violates the third party’s rights.  You agree not to create an Account or use R2.ai Properties if you have been previously removed by R2.ai, or if you have been previously banned from any of R2.ai Properties.</p>
            <p>2.3Your Account. Notwithstanding anything to the contrary herein, you acknowledge and agree that you shall have no ownership or other property interest in your Account, and you further acknowledge and agree that all rights in and to your Account are and shall forever be owned by and inure to the benefit of R2.ai. </p>
            <p>2.4Necessary Equipment and Software.  You must provide all equipment and software necessary to connect to R2.ai Properties, including but not limited to, a mobile device that is suitable to connect with and use R2.ai Properties, in cases where the Services offer a mobile component.  You are solely responsible for any fees, including Internet connection or mobile fees, that you incur when accessing R2.ai Properties.  By providing your cellphone number and using the Services, you hereby affirmatively consent to our use of your cellphone number for calls and texts in order to perform and improve upon the Services. R2.ai will not assess and charge for any calls or texts, but standard message charges or other charged from your wireless carrier may apply.  You may opt out of receiving text messages from us by adjusting your user preferences in your Account Profile or by emailing ________contact@r2.ai_____________.</p>
            <p>3.Responsibility for Content.</p>
            <p>3.1Types of Content.  You acknowledge that all files, materials, data, text, audio, video, images, information, or other content, including R2.ai Properties (“Content”), is the sole responsibility of the party from whom such Content originated.  This means that you, and not R2.ai, are entirely responsible for all Content that you upload, post, e-mail, transmit or otherwise make available (“Make Available”) through the R2.ai Platform (“Your Content”) and that you and other Users of R2.ai Properties, and not R2.ai, are similarly responsible for all Content they Make Available through R2.ai Properties (“User Content”).</p>
            <p>3.2No Obligation to Pre-Screen Content.  You acknowledge that R2.ai has no obligation to pre-screen Your Content although R2.ai reserves the right in its sole discretion to pre-screen, refuse or remove any Content.  By entering into the Agreement, you hereby provide your irrevocable consent to such monitoring.  In the event that R2.ai pre-screens, refuses or removes any Content, you acknowledge that R2.ai will do so for R2.ai’s benefit, not yours.  Without limiting the foregoing, R2.ai shall have the right to remove any Content that violates the Agreement or is otherwise objectionable. </p>
            <p>4.Ownership.</p>
            <p>4.1R2.ai Properties.  Except with respect to Your Content, Survey Content and User Content, you agree that R2.ai and its suppliers own all rights, title and interest in R2.ai Properties (including but not limited to, any computer code) and Surveys. You will not remove, alter or obscure any copyright, trademark, service mark or other proprietary rights notices incorporated in or accompanying the Website, the Services, Application or R2.ai Properties.</p>
            <p>4.2Trademarks. and other related graphics, logos, service marks and trade names used on or in connection with R2.ai Properties or in connection with the Services are the trademarks of R2.ai and may not be used without permission in connection with any third-party products or services.  Other trademarks, service marks and trade names that may appear on or in R2.ai Properties are the property of their respective owners.</p>
            <p>4.3Other Content.  Except with respect to Your Content and Survey Content, you agree that you have no right or title in or to any Content that appears on or in R2.ai Properties.</p>
            <p>4.4Your Content.  R2.ai does not claim ownership of Your Content.  However, when you as a User post, publish, upload, or transmit Your Content on or in R2.ai Properties, you represent that you own and/or have a royalty-free, perpetual, irrevocable, worldwide, non-exclusive right (including any moral rights) and license to use, license, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, derive revenue or other remuneration from, and communicate to the public, perform and display Your Content (in whole or in part) worldwide and/or to incorporate it in other works in any form, media or technology now known or later developed, for the full term of any worldwide intellectual property right that may exist in Your Content (“Content Rights”).  Moreover, by posting, publishing, uploading, or otherwise transmitting Your Content on or in the R2.ai Properties, you hereby grant to R2.ai the Content Rights for the purposes of providing the Services and/or its other legitimate business purposes.</p>
            <p>4.5Feedback.  You agree that submission of any ideas, suggestions, documents, and/or proposals to R2.ai through its suggestion, feedback, wiki, forum or similar pages (“Feedback”) is at your own risk and that R2.ai has no obligations (including without limitation obligations of confidentiality) with respect to such Feedback.  You represent and warrant that you have all rights necessary to submit the Feedback. You hereby grant to R2.ai a fully paid, royalty-free, perpetual, irrevocable, worldwide, non-exclusive, and fully sublicensable right and license to use, reproduce, perform, display, distribute, adapt, modify, re-format, create derivative works of, and otherwise commercially or non-commercially exploit in any manner, any and all Feedback, and to sublicense the foregoing rights, in connection with the operation and maintenance of R2.ai Properties.</p>
            <p>5.User Conduct.  As a condition of your use of the R2.ai Properties, you agree not to use R2.ai Properties for any purpose that is prohibited by the Agreement or by applicable law. You shall not (and shall not permit any third party) either (a) take any action or (b) Make Available any Content on or through R2.ai Properties that: (i) infringes any patent, trademark, trade secret, copyright, right of publicity or other right of any person or entity; (ii) is unlawful, threatening, abusive, harassing, defamatory, libelous, deceptive, fraudulent, invasive of another’s privacy, tortious, obscene, offensive, or profane; (iii) constitutes unauthorized or unsolicited advertising, junk or bulk e-mail; (iv) involves commercial activities and/or sales without R2.ai’s prior written consent; (v) impersonates any person or entity, including any employee or representative of R2.ai or R2.ai’s customers; (vi) interferes with or attempt to interfere with the proper functioning of R2.ai Properties or uses R2.ai Properties in any way not expressly permitted by the Agreement; or (vii) attempts to engage in or engage in, any potentially harmful acts that are directed against R2.ai Properties, including but not limited to violating or attempting to violate any security features of R2.ai Properties, using manual or automated software or other means to access, “scrape,” “crawl” or “spider” any pages contained in R2.ai Properties, introducing viruses, worms, or similar harmful code into R2.ai Properties, or interfering or attempting to interfere with use of R2.ai Properties by any other user, host or network, including by means of overloading, “flooding,” “spamming,” “mail bombing,” or “crashing” R2.ai Properties.</p>
            <p>6.Investigations.  R2.ai may, but is not obligated to, monitor or review R2.ai Properties and Content at any time.  Without limiting the foregoing, R2.ai shall have the right, in its sole discretion, to remove any of Your Content for any reason (or no reason), including if such Content violates the Agreement or any applicable law.  Although R2.ai does not generally monitor user activity occurring in connection with R2.ai Properties or Content, if R2.ai becomes aware of any possible violations by you of any provision of the Agreement, R2.ai reserves the right to investigate such violations, and R2.ai may, at its sole discretion, immediately terminate your license to use R2.ai Properties, or change, alter or remove Your Content, in whole or in part, without prior notice to you.</p>
            <p>7.Third-Party Services.</p>
            <p>7.1Third-Party Websites, Applications. R2.ai Properties may contain links to third-party websites (“Third-Party Websites”) and applications (“Third-Party Applications”).  When you click on a link to a Third-Party Website or Third-Party Application, we will not warn you that you have left R2.ai Properties and are subject to the Agreement and conditions (including privacy policies) of another website or destination.  Such Third-Party Websites and Third-Party Applications are not under the control of R2.ai.  R2.ai is not responsible for any Third-Party Websites or Third-Party Applications.  R2.ai provides these Third-Party Websites or Third-Party Applications only as a convenience and does not review, approve, monitor, endorse, warrant, or make any representations with respect to Third-Party Websites or Third-Party Applications, or their products or services.  You use all links in Third-Party Websites or Third-Party Applications at your own risk. When you leave our Website, this Agreement and our policies no longer govern.  You should review applicable terms and policies, including privacy and data gathering practices, of any Third-Party Websites or Third-Party Applications, and should make whatever investigation you feel necessary or appropriate before proceeding with any transaction with any third party. </p>
            <p>7.2App Stores.  You acknowledge and agree that the availability of the Application is dependent on the third party from whom you received the Application license, e.g., the Apple App Store or Google Play (“App Store”).  You acknowledge that the Agreement is between you and R2.ai and not with the App Store.  R2.ai, not the App Store, is solely responsible for R2.ai Properties, including the Application, the content thereof, maintenance, support services, and warranty therefor, and addressing any claims relating thereto (e.g., product liability, legal compliance or intellectual property infringement).  In order to use the Application, you must have access to a wireless network, and you agree to pay all fees associated with such access.  You also agree to pay all fees (if any) charged by the App Store in connection with R2.ai Properties, including the Application.  You agree to comply with, and your license to use the Application is conditioned upon your compliance with, all applicable third-party terms of agreement (e.g., the App Store’s terms and policies) when using R2.ai Properties, including the Application. You acknowledge that the App Store (and its subsidiaries) are third-party beneficiaries of the Agreement and will have the right to enforce them.</p>
            <p>8.Disclaimer of Warranties and Conditions.</p>
            <p>8.1As Is. YOU EXPRESSLY UNDERSTAND AND AGREE THAT TO THE EXTENT PERMITTED BY APPLICABLE LAW, YOUR USE OF R2.ai PROPERTIES IS AT YOUR SOLE RISK, AND R2.ai PROPERTIES ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS, WITH ALL FAULTS.  R2.ai PARTIES EXPRESSLY DISCLAIM ALL WARRANTIES, REPRESENTATIONS, AND CONDITIONS OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT ARISING FROM USE OF THE WEBSITE.  </p>
            <p>(a)NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED FROM R2.ai OR THROUGH R2.ai PROPERTIES WILL CREATE ANY WARRANTY NOT EXPRESSLY MADE HEREIN.</p>
            <p>(b)FROM TIME TO TIME, R2.ai MAY OFFER NEW “BETA” FEATURES OR TOOLS WITH WHICH ITS USERS MAY EXPERIMENT.  SUCH FEATURES OR TOOLS ARE OFFERED SOLELY FOR EXPERIMENTAL PURPOSES AND WITHOUT ANY WARRANTY OF ANY KIND, AND MAY BE MODIFIED OR DISCONTINUED AT R2.ai’S SOLE DISCRETION. THE PROVISIONS OF THIS SECTION APPLY WITH FULL FORCE TO SUCH FEATURES OR TOOLS.</p>
            <p>8.2No Liability for Conduct of Third Parties.  YOU ACKNOWLEDGE AND AGREE THAT R2.ai PARTIES ARE NOT LIABLE, AND YOU AGREE NOT TO SEEK TO HOLD R2.ai PARTIES LIABLE, FOR THE CONDUCT OF THIRD PARTIES ON THE WEBSITE OR SERVICES, INCLUDING OPERATORS OF EXTERNAL SITES, AND THAT THE RISK OF INJURY FROM SUCH THIRD PARTIES RESTS ENTIRELY WITH YOU.</p>
            <p>9.Limitation of Liability.</p>
            <p>9.1Disclaimer of Certain Damages. YOU UNDERSTAND AND AGREE THAT IN NO EVENT SHALL R2.ai PARTIES BE LIABLE FOR ANY LOSS OF PROFITS, REVENUE OR DATA, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH R2.ai PROPERTIES, OR DAMAGES OR COSTS DUE TO LOSS OF PRODUCTION OR USE, BUSINESS INTERRUPTION, WHETHER OR NOT R2.ai HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, ARISING OUT OF OR IN CONNECTION WITH THE AGREEMENT, OR FROM ANY COMMUNICATIONS, INTERACTIONS OR MEETINGS WITH OTHER USERS OF R2.ai PROPERTIES, WHETHER BASED ON WARRANTY, COPYRIGHT, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY OR ANY OTHER LEGAL THEORY. THE FOREGOING CAP ON LIABILITY SHALL NOT APPLY TO LIABILITY OF A R2.ai PARTY FOR (A) DEATH OR PERSONAL INJURY CAUSED BY A R2.ai PARTY’S NEGLIGENCE; OR FOR (B) ANY INJURY CAUSED BY A R2.ai PARTY’S FRAUD OR FRAUDULENT MISREPRESENTATION. </p>
            <p>9.2Cap on Liability.  UNDER NO CIRCUMSTANCES WILL R2.ai PARTIES BE LIABLE TO YOU FOR MORE THAN FIFTY DOLLARS ($50) AS A RESULT OF YOUR USE OF R2.ai PROPERTIES, INCLUDING BUT NOT LIMITED TO YOUR PARTICIPATION IN ANY SURVEYS.</p>
            <p>9.3User Content.  EXCEPT FOR R2.ai’S OBLIGATIONS TO PROTECT YOUR PERSONAL DATA AS SET FORTH IN THE R2.ai PRIVACY POLICY,  R2.ai ASSUMES NO RESPONSIBILITY FOR THE TIMELINESS, DELETION, MIS-DELIVERY OR FAILURE TO STORE ANY CONTENT (INCLUDING, BUT NOT LIMITED TO, YOUR PUBLIC CONTENT, SURVEY CONTENT AND USER CONTENT), USER COMMUNICATIONS OR PERSONALIZATION SETTINGS.</p>
            <p>9.4Basis of the Bargain.  THE LIMITATIONS OF DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN R2.ai AND YOU.</p>
            <p>10.Remedies.</p>
            <p>10.1Breach.  In the event that R2.ai determines, in its sole discretion, that you have breached any portion of the Agreement, or have otherwise demonstrated conduct inappropriate for R2.ai Properties, R2.ai reserves the right to delete any of Your Content provided by you or your agent(s) to R2.ai Properties and/or discontinue your registration(s) with the any of R2.ai Properties, including any Services or any R2.ai community.</p>
            <p>11.Term and Termination.  </p>
            <p>11.1Term.  This Agreement commences on the date when you accept it (as described in the preamble above) and remain in full force and effect while you use R2.ai Properties, unless terminated earlier in accordance with the Agreement.</p>
            <p>11.2Prior Use.  Notwithstanding the foregoing, if you used R2.ai Properties prior to the date you accepted the Terms, you hereby acknowledge and agree that the Agreement commenced on the date you first used R2.ai Properties (whichever is earlier) and will remain in full force and effect while you use R2.ai Properties, unless earlier terminated in accordance with the Agreement.</p>
            <p>11.3Termination of Services by R2.ai.  R2.ai has the right to, immediately and without notice, suspend or terminate your access to the R2.ai Properties.  Further, if you have materially breached any provision of the Agreement, or if R2.ai is required to do so by law (e.g., where the provision of the Website, the Software, the Application or the Services is, or becomes unlawful), R2.ai has the right to, immediately and without notice, suspend or terminate your access to any or all of the R2.ai Properties. You agree that all terminations for cause shall be made in R2.ai’s sole discretion and that R2.ai shall not be liable to you or any third-party for any termination of your Account.</p>
            <p>11.4Effect of Termination.  Termination of any Service includes removal of access to such Service and barring of further use of the Service.  Termination of all Services also includes deletion of your password and Your Content.  Upon termination of any Service, your right to use such Service will automatically terminate immediately. You understand that any termination of Services may involve deletion of Your Content associated therewith from our live databases.  All provisions of the Agreement which by their nature should survive, shall survive termination of Services, including without limitation, ownership provisions, warranty disclaimers, and limitation of liability.</p>
            <p>12.General Provisions.</p>
            <p>12.1Electronic Communications.  The communications between you and R2.ai use electronic means, whether you visit R2.ai Properties or send R2.ai e-mails, or whether R2.ai posts notices on R2.ai Properties or communicates with you via e-mail.  For contractual purposes, you (1) consent to receive communications from R2.ai in an electronic form; and (2) agree that all Agreement and conditions, agreements, notices, disclosures, and other communications that R2.ai provides to you electronically satisfy any legal requirement that such communications would satisfy if it were to be in writing.  The foregoing does not affect your statutory rights.</p>
            <p>12.2Assignment.  The Agreement, and your rights and obligations hereunder, may not be assigned, subcontracted, delegated or otherwise transferred by you without R2.ai’s prior written consent, and any attempted assignment, subcontract, delegation, or transfer in violation of the foregoing will be null and void.</p>
            <p>12.3Force Majeure.  R2.ai shall not be liable for any delay or failure to perform resulting from causes outside its reasonable control, including, but not limited to, acts of God, war, terrorism, riots, embargos, acts of civil or military authorities, fire, floods, accidents, strikes or shortages of transportation facilities, fuel, energy, labor or materials. </p>
            <p>12.4Questions, Complaints, Claims.  If you have any questions, complaints or claims with respect to R2.ai Properties, please contact us at: R2.ai, Inc., Attn: Questions, Complaints & Claims, contact@r2.ai .  We will do our best to address your concerns.  If you feel that your concerns have been addressed incompletely, we invite you to let us know for further investigation.</p>
            <p>12.5Exclusive Venue.  Both you and R2.ai agree that all claims and disputes arising out of or relating to the Agreement will be litigated exclusively in the state or federal courts located in California.</p>
            <p>12.6Governing Law THE AGREEMENT AND ANY ACTION RELATED THERETO WILL BE GOVERNED AND INTERPRETED BY AND UNDER THE LAWS OF THE STATE OF CALIFORNIA, WITHOUT GIVING EFFECT TO ANY PRINCIPLES THAT PROVIDE FOR THE APPLICATION OF THE LAW OF ANOTHER JURISDICTION.  THE UNITED NATIONS CONVENTION ON CONTRACTS FOR THE INTERNATIONAL SALE OF GOODS DOES NOT APPLY TO THESE AGREEMENT.</p>
            <p>12.7Notice.  Where R2.ai requires that you provide an e-mail address, you are responsible for providing R2.ai with your most current e-mail address.  In the event that the last e-mail address you provided to R2.ai is not valid, or for any reason is not capable of delivering to you any notices required/ permitted by the Agreement, R2.ai’s dispatch of the e-mail containing such notice will nonetheless constitute effective notice.  You may give notice to R2.ai at the following address: contact@r2.ai.  Such notice shall be deemed given when received by R2.ai by letter delivered by nationally recognized overnight delivery service or first class postage prepaid mail at the above address.</p>
            <p>12.8Waiver.  Any waiver or failure to enforce any provision of the Agreement on one occasion will not be deemed a waiver of any other provision or of such provision on any other occasion.</p>
            <p>12.9Severability.  If any portion of this Agreement is held invalid or unenforceable, that portion shall be construed in a manner to reflect, as nearly as possible, the original intention of the parties, and the remaining portions shall remain in full force and effect.</p>
            <p>12.10Export Control.  You may not use, export, import, or transfer R2.ai Properties except as authorized by U.S. law, the laws of the jurisdiction in which you obtained R2.ai Properties, and any other applicable laws.  In particular, but without limitation, R2.ai Properties may not be exported or re-exported (a) into any United States embargoed countries, or (b) to anyone on the U.S. Treasury Department’s list of Specially Designated Nationals or the U.S. Department of Commerce’s Denied Person’s List or Entity List. By using R2.ai Properties, you represent and warrant that (i) you are not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a “terrorist supporting” country and (ii) you are not listed on any U.S. Government list of prohibited or restricted parties. You also will not use R2.ai Properties for any purpose prohibited by U.S. law, including the development, design, manufacture or production of missiles, nuclear, chemical or biological weapons.  You acknowledge and agree that products, services or technology provided by R2.ai are subject to the export control laws and regulations of the United States.  You shall comply with these laws and regulations and shall not, without prior U.S. government authorization, export, re-export, or transfer R2.ai products, services or technology, either directly or indirectly, to any country in violation of such laws and regulations.</p>
            <p>12.11Accessing and Download the Application from iTunes.  The following applies to any App Store Sourced Application accessed through or downloaded from the Apple App Store: </p>
            <p>(a)You acknowledge and agree that (i) the Agreement is concluded between you and R2.ai only, and not Apple, and (ii) R2.ai, not Apple, is solely responsible for the App Store Sourced Application and content thereof. Your use of the App Store Sourced Application must comply with the App Store Agreement of Service. </p>
            <p>(b)You acknowledge that Apple has no obligation whatsoever to furnish any maintenance and support services with respect to the App Store Sourced Application. </p>
            <p>(c)In the event of any failure of the App Store Sourced Application to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price for the App Store Sourced Application to you and to the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the App Store Sourced Application. As between R2.ai and Apple, any other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any warranty will be the sole responsibility of R2.ai. </p>
            <p>(d)You and R2.ai acknowledge that, as between R2.ai and Apple, Apple is not responsible for addressing any claims you have or any claims of any third party relating to the App Store Sourced Application or your possession and use of the App Store Sourced Application, including, but not limited to: (i) product liability claims; (ii) any claim that the App Store Sourced Application fails to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection or similar legislation.</p>
            <p>(e)You and R2.ai acknowledge that, in the event of any third-party claim that the App Store Sourced Application or your possession and use of that App Store Sourced Application infringes that third party’s intellectual property rights, as between R2.ai and Apple, R2.ai, not Apple, will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim to the extent required by the Agreement. </p>
            <p>(f)You and R2.ai acknowledge and agree that Apple, and Apple’s subsidiaries, are third-party beneficiaries of the Agreement as related to your license of the App Store Sourced Application, and that, upon your acceptance of the terms and conditions of the Agreement, Apple will have the right (and will be deemed to have accepted the right) to enforce the Agreement as related to your license of the App Store Sourced Application against you as a third-party beneficiary thereof. </p>
            <p>(g)Without limiting any other terms of the Agreement, you must comply with all applicable third-party terms of agreement when using the App Store Sourced Application.</p>
            <p>12.12Entire Agreement.  The Agreement is the final, complete and exclusive agreement of the parties with respect to the subject matter hereof and supersedes and merges all prior discussions between the parties with respect to such subject matter.</p>
            <p>End of Agreement</p>
            <br/>
        </div>:
        <div className={styles.content}>
            <h5>终端客户许可协议</h5>
            <h5>版本1.0</h5>
            <h5>生效日期: 1/1/2018</h5>
            <h5>最后更新日期: 5/1/2018</h5>
            <h5> </h5>
            <p>请仔细阅读本终端用户许可协议（英文缩写“EULA”）。R2.ai(“R2.ai”)公司的网站（“网站”）、产品和服务，其关联方或代理商以及由R2.ai公司控制的相关信息的总和，R2.ai公司的网站、产品和服务，在本协议简称“服务”。服务的使用均受EULA管辖，不管是使用、下载、安装软件或进入在线平台还是申请用户访问或以任何形式使用服务（“用户”），包括通过网站使用服务和可用资源。通过点击“我接受”按钮，完成注册过程，和/或浏览网站，下载或安装任何R2.ai软件，或下载R2.ai的手机应用（“应用”），代表（1）您已阅读、理解并同意受EULA约束，（2）您已达到与R2.ai之间建立合同关系的法定年龄，（3）您有权以个人名义签订EULA，或具有代表雇主签订EULA的授权，或者具有将实体指定为用户，并使该实体受EULA约束的授权。“您”指的是当在网站上注册时被认定为用户的个人或法律实体，如适用。如果您不同意或不接受EULA的约束，将不能访问或使用网站、应用或服务。</p>
            <p>您对某些服务的使用和参与可能受补充协议（“补充协议”）的约束。此类补充协议会在EULA中列示或在您注册使用补充服务时向您提交以获得接受。如果EULA与补充协议不一致，此类服务受补充协议的约束。EULA和任何适用的补充协议简称为“协议”。</p>
            <p>请注意该协议可由R2.ai于任何时候自行决定修改。一旦进行修改，R2.ai会将新版协议在网站或应用上进行公示，任何新版补充协议会在网站或应用内通过受影响的服务进行提供。我们也会将最后修改日期在EULA文首进行更新。如果我们进行了重大变更，在您注册账户(定义详见以下2.1条)时，依据协议，我们将会向您提供的最新邮件地址发送邮件。任何本协议的修改，对于网站、应用和/或服务的新用户将立即生效，对于现存用户，此类更改将于公示通知30天后生效，且任何重大变化对已有账户用户将会于较通知公示后30天，或对注册用户(定义详见以下2.1条)发送通知更改邮件后30天中较早的时候生效。R2.ai可能要求您在进一步使用网站、应用和/或服务被允许前同意更新后的协议。如果您收到变更通知后不同意任何变更，您应当停止使用网站、应用和/或服务。反之，继续使用网站、应用和/或服务则视为接受变更。请经常性查阅网站浏览现行协议。</p>
            <p>1.使用服务和R2.ai所有物。通过网站、应用和服务可获取的应用、软件、网站、服务（以本协议对这些术语的定义为准）（统称“R2.ai所有物”）和相关信息及内容在全球范围内受到版权保护。根据本协议，在一定的地域内，仅出于个人或内部商务使用目的使用服务，R2.ai通过限制性许可证授权您复制部分R2.ai所有物。除非R2.ai独立许可另有说明，您使用任何R2.ai所有物须受本协议约束。</p>
            <p>           1.1 应用许可证。  在您遵守协议的前提下，仅为您自身目的或内部商务目的， R2.ai可在地域内将授予您有限的、不排他、不可转让、不可分许可、可撤销的许可证，以便进行应用的副本的下载、安装或运行。此外，对于任何从苹果应用商店（“苹果应用商店应用程序”）进入或下载的应用，您只能使用苹果应用商店应用程序(i)在一个苹果品牌产品上运行IOS（苹果专有操作系统）和(ii)被苹果应用商店服务协议规定的使用规则所允许。</p>
            <p>           1.2  R2.ai软件。R2.ai已经开发了一个人工智能平台（“R2.ai平台”），该平台可用于商业数据分析并通过客户定制的人工智能模型创建商业视野。使用由网站或服务（“软件”）所提供的R2.ai平台和任何其他软件及相关文档，除应用外，受到与软件一起在网页上明确说明的软件许可协议的约束。这些许可条款可能在软件下载时公示，或在进入软件的网页显示。除非您同意此类许可协议，否则您不得使用、下载、安装任何伴随或包含许可协议的软件。公司在任何时候都不会向您提供我方软件的有形拷贝。公司应通过电子转存或下载的方式提供软件访问，不得使用或提供任何与下列用途相关的有形媒介：（a）交付、安装、更新软件或解决任何软件的问题（b）交付、更正或更新文件。本款所称有形媒介应包括但不限于任何磁带盘、光盘、卡片、闪存驱动器或任何其他类似的实物媒介。除非相应的许可证协议明示允许，否则任何复制、分销软件的行为均被禁止，包括任何复制、分销软件至其他任何服务器、地点或在服务局基础上进行分销或使用。如本协议与许可证协议存在冲突以软件相关的许可证协议为准（下述情况除外）。如果软件是预发布版本，尽管在许可证协议中包含了与此相反的内容，您不允许使用或以其他方式依赖该软件进行任何商业或生产用途。如果使用软件无相应许可证协议，则使用软件将受本协议约束。R2.ai 在任何时候均不向您提供任何软件的实体副本。在你遵守本协议的前提下， 出于使您可以按本协议允许的方式使用服务的目的，R2.ai可在地区内授予您不可指派、不可转让、不可分许可、可撤销的许可以便使用软件。.</p>
            <p>1.3  更新。 您已知悉并理解R2.ai所有物是不断更新的。因此，R2.ai有权要求您接受对您已安装在电脑或移动设备上的R2.ai所有物的更新。您确认并同意R2.ai有权在通知或不通知您的情况下更新R2.ai所有物。您需要不时更新第三方软件以便使用R2.ai所有物。</p>
            <p>1.4  某些限制。 本协议项下授予您的权利将受以下限制：（a）您不得许可、出售、出租、租赁、出让、转让、复制、分销、托管或以其他商业方式开发R2.ai所有物或R2.ai所有物的任何部分，包括网站；（b）您不得设计或利用框架技术融入任何商标、标志或其他R2.ai所有物（包括图片、文字、页面布局或图表）;（c）您不得使用任何含有R2.ai名称或商标的元标签或其他“隐藏文字”;（d）你不得就R2.ai所有物的任何部分进行修改、翻译、改编、合并、制作衍生作品、分解，解码，反编译或反向工程，除非上述限制由法律明文禁止；（e）您不得使用任何人工或自动化的软件、设备或其他程序（包括但不限于蜘蛛、机器人、刮刀、爬虫、头像、数据挖掘工具或类似工具）从网站的任何网页中“刮”或下载数据（除了我们授予可撤销许可的公共搜索引擎经营者，仅以创建公开可获取的材料可搜索索引为唯一目的并仅在此必要范围内，利用蜘蛛从网站复印材料，但不是这些材料的缓存或存档）;（f）您不得为创建类似或竞争性网站访问R2.ai所有物;(g) 除本协议明文规定，R2.ai所有物的任何部分均不可拷贝，复制，分销，转载、下载、显示、张贴或通过任何方式以任何形式传播;（h）您不得删除或损毁R2.ai所有物上的任何版权告示或其他专有标签。R2.ai所有物任何将来发布的更新或其他版本应当受本协议约束。R2.ai，其供应商及服务提供者保留本协议所未授予的全部权利。任何未经授权对R2.ai所有物的使用将导致R2.ai根据本协议授予的许可终止。</p>
            <p>1.5	第三方材料。作为R2.ai所有物的一部分，您可以访问第三方托管的材料。您已同意R2.ai不可能监管这些材料，您在访问这些材料时自行承担风险。</p>
            <p>2.      注册</p>
            <p>           2.1   注册您的账户。  为了访问R2.ai所有物的某些特征，您可能被要求成为注册用户。出于本协议之目的，“注册用户”是指使用用户雇主提供给该用户的访问凭证就服务（“账户”）注册了账户的用户。</p>
            <p>2.2   注册数据。在网站上注册账时，您已同意：（1）根据注册表格（“注册数据”）的提示提供您的真实、准确、现有、完整的信息；（2）保持和及时更新注册数据确保数据真实、准确、现有、完整。您已表示（1）您已年满18周岁；（2）已达到签订合同的法定年龄；（3）您不是被美国法律、居住地法律或其他适用的管辖区禁止使用R2.ai所有物的人。您对您账户中的所有行为负责。您同意您应当管控您的账户限制未成年人使用，您将对任何未成年人对R2.ai所有物的非授权使用承担全部责任。您不可以与他人分享账户或密码，您同意(1)就任何非授权使用您的密码或任何其他破坏安全的行为立刻通知R2.ai；（2）每阶段使用结束退出账户。如果您提供任何不真实、不准确、非现有或不完全的信息，或R2.ai有理由怀疑这些信息是不真实、不准确、非现有或不完全的，R2.ai有权暂停或终止您的账户且拒绝所有现时或将来对R2.ai所有物的使用（或任何R2.ai所有物的部分）。您同意不会出于他人的利益使用虚假身份或信息创建账户。您同意您任何时候拥有的账户都不多于一个。R2.ai保留在任何时候以任何理由取消或收回任何用户名的权利，包括但不限于，第三方声称用户名侵犯第三方权利。如您之前被R2.ai移除或被任何R2.ai禁止，您同意不会创建账户或使用R2.ai所有物。</p>
            <p>2.3  您的账户。   尽管有相反的规定，您承认并同意您不应拥有您账户的所有权或其他财产权益，并且您进一步承认并同意您账户中的所有权利应由R2.ai永远拥并受益。</p>
            <p>2.4必要的设备和软件。    您必须提供必要的设备和软件用以访问R2.ai所有物，包括但不限于，在服务提供移动部分的情况下，适宜连接并使用R2.ai所有物的移动设备。您对您访问R2.ai所有物发生的任何费用全权负责，包括互联网连接或手机费。提供您的手机号码并使用服务，代表您确定地同意我们使用您的手机号打电话或发短信，以便提供服务、改进服务。R2.ai将不会对任何电话或短信收费，但您的无线供应商可以对标准短信或其他收费。您可以通过调整您的用户偏好来选择退出短信接收服务，您可以通过您账户的个人主页或发邮件至contact@r2.ai进行调整。</p>
            <p>3.   内容责任</p>
            <p>3.1内容类型。  您知晓所有文件、材料、数据、文本、音频、视频、图片、信息或其他内容，包括R2.ai所有物（“内容”），仅由内容来源方负责。这意味着您，而不是R2.ai，应对您通过R2.ai平台上传、张贴、邮件、传输或其他方式提供的（“提供”）全部内容负责，并且您和其他R2.ai所有物的用户，而非R2.ai对通过R2.ai所有物提供的所有内容承担同等责任（”用户内容“）。</p>
            <p>3.2 无筛选内容义务。尽管R2.ai保留任意筛选、拒绝或移除任何内容的权利，您承认R2.ai没有义务对您的内容进行筛选。一旦签订本协议，表明您不可撤销地同意该等监测。如果R2.ai筛选、拒绝或移除任何内容，您承认R2.ai的该等行为是出于R2.ai的利益，而非您的利益。不限于前述，R2.ai有权移除任何违反本协议或其他令人反感的内容。</p>
            <p>4. 所有权</p>
            <p>4.1 R2.ai所有物。 除您的内容、调查内容、用户内容之外，您同意R2.ai及其供应商拥有R2.ai所有物及调查（包括但不限于，任何计算机代码）的所有权利、权属和利益。您不会删除、改变或掩盖包含或伴随于网站、服务、应用或R2.ai所有物中的任何版权、商标、服务标记或其他所有权权益声明。</p>
            <p>4.2 商标。  与 R2.ai所有物或服务相关联使用的  及其相关的图片、标志、服务标志和商号是R2.ai商标，没有许可不得用于任何第三方产品或服务。其他可能出现在R2.ai 所有物上的商标、服务标志和商号是其相应所有者的财产。</p>
            <p>4.3 其他内容。除您的内容及调查内容之外，您同意对于出现在R2.ai所有物上的任何内容不享有权利。</p>
            <p>4.4 您的内容。 R2.ai 不要求对您的内容享有所有权。然而，当你作为一个用户在R2.ai所有物上发布、出版、上传、传输您的内容，视为您所有和/或享有免费的、永久的、不可撤销的、世界范围内的非排他的权利（包括任何道德权利）和许可，这些权利和许可使您可以使用、许可、复制、修改、改编、出版、翻译、创建衍生作品、分销、获得收益和报酬、与公众沟通、在世界范围内（全世界或部分地区）演示和展示您的内容，和/或使您可以将您的内容以任何形式、媒介、已知或将来开发的技术融入其他作品，您的内容拥有任何世界性的完整期限的知识产权权利（“内容权利”）。而且，通过张贴、发布、上传或其他方式在R2.ai所有物上传输您的内容，您在此，出于提供服务和其他合法业务目的授予R2.ai内容权利。</p>
            <p>4.5 反馈。 您同意通过R2.ai的建议、反馈、维基、论坛或类似页面（“反馈”）向R2.ai提交任何想法、建议、文件和/或提议，您将自行承担风险，R2.ai对于这些反馈没有义务(包括无限保密义务)。您保证您拥有所有提交反馈所必要的权利。您在此授予R2.ai拥有全面的、免费的、永久的、不可撤销的、世界性的、非排他的、全面的可分许可的权利和许可，以便基于运营、维护R2.ai所有物，对任何反馈进行使用、复制、运行、展示、分销、改编、修改、重新格式化、创建衍生作品、以任何形式进行商业或非商业开发并分许可前述权利。</p>
            <p>5. 用户行为。 作为您使用R2.ai所有物的条件，您同意不以本协议或适用法律禁止的目的使用R2.ai所有物。您不得（不得允许第三方）通过R2.ai所有物采取下列行动或通过R2.ai所有物提供任何下列内容：(1)侵犯任何其他人或实体的专利、商标、商业秘密、版权、公示权或其他权利；(2) 进行违法行为，不得进行威胁、辱骂、骚扰、诽谤、中伤、欺骗、欺诈、侵犯他人隐私，不得侵权、淫秽、攻击、或违反公序良俗； (3) 发送非无授权或不请自来的广告、垃圾邮件、群发邮件； (4) 非经R2.ai 事先书面同意，进行商业行为和/或销售；(5) 冒充任何个人或实体，包括任何R2.ai的雇员或代表或R2.ai的客户; (6) 干扰或企图干扰R2.ai 所有物的正常运行或以任何本协议未明示允许的方式使用R2.ai 所有物; 或(7) 试图从事或从事任何潜在的直接针对R2.ai 所有物的危害行为，包括但不限于违反或试图违反任何R2.ai 所有物的安全特性，使用人工或自动软件或其他方式对R2.ai 所有物上的任何页面进行访问，使用“刮”、“爬虫”、“蜘蛛”软件，引入病毒，蠕虫，或类似的有害代码,或用任何其他用户、主页或网络对R2.ai 所有物进行干扰或尝试干扰，包括超载、“洪水”、“垃圾邮件”、“邮件炸弹“，”或使R2.ai 所有物“崩溃”。</p>
            <p>6  调查。  R2.ai可以，但无义务，在任何时候监测或浏览R2.ai 所有物和内容。不限于前述，R2.ai应当有权自行决定以任何理由(或无理由)删除您的内容，包括违反本协议或任何适用法律的内容。R2.ai一般不监测与R2.ai所有物或内容有关的用户行为，但是如果R2.ai意识到您任何有可能违反本协议规定的行为，R2.ai保留调查这些违反行为的权利，R2.ai可以在无需提前通知您的情况下，自行决定终止您使用R2.ai所有物的许可，或变更、改变、删除您的全部或部分内容。</p>
            <p>7    第三方服务</p>
            <p>7.1 第三方网站和应用。  R2.ai所有物可能包含第三方网站（“第三方网站”）和应用程序（“第三方应用”）的链接。当您点击一个链接至第三方网站或第三方应用，我们不会提醒您已经离开R2.ai所有物并且受到另一网站或目的地协议和条件的约束（包括隐私政策）。这些第三方网站和第三方应用不受R2.ai控制。R2.ai不对任何第三方网站和第三方应用负责。R2.ai仅仅为这些第三方网站和第三方应用提供一个方便，对于第三方网站或第三方应用的产品和服务，R2.ai不进行浏览、批准、监督、认可、授权或作出任何陈述。您使用第三方网站或第三方应用的链接时自行承担风险。当您离开我们的网站是，本协议和我们的政策不再管辖。您应该浏览适用的条款和政策，包括第三方网站或第三方应用的隐私和数据搜集惯例，确保在与任何第三方进行任何交易前，进行任何您认为必要或适当的调查。.</p>
            <p>7.2 应用商店。  您承认并同意应用的有用性依赖于您获取应用许可的第三方，比如，苹果应用商店或谷歌玩（“应用商店”）。您知晓本协议是您和R2.ai之间的而不是与应用商店之间。R2.ai，而非应用商店，仅对R2.ai所有物负责，包括应用、其内容、维护、支持服务和对此的保证，及解决任何有关的索赔（产品责任、法律合规或知识产权侵权）。为使用应用，您必须访问无线网络，您同意为此支付相关费用。您亦同意支付由应用商店收取的与R2.ai所有物包括应用相关的所有费用（如有）。您同意当使用R2.ai所有物包括应用时，遵守所有适用的第三方协议条款并且您使用应用的许可证以您的遵守为条件（例如，应用商店的条件和政策）。您知晓应用商店（及其分支机构）是本协议的第三方受益人且有权执行本协议。</p>
            <p>8   保证与条件的免除</p>
            <p>8.1 现状。您明示理解并同意在现有法律允许的范围内，您使用R2.ai所有物自担风险，R2.ai所有物以现状交付，瑕疵毕陈。R2.ai方明示对所有明示或暗示的保证、陈述和条件免责，包括但不限于暗示的保证或适销性条件，目的适当性和网站使用非侵权性。</p>
            <p>(a) 来源于R2.ai或通过R2.ai所有物的意见或信息，不论口头或书面的，均不会在此产生任何暗示性的保证。</p>
            <p>(b)  一直以来，R2.ai可提供用户可以进行尝试的新“BETA”特性或工具。这些特性和工具仅处于尝试目的提供，不带有任何性质的保证，且可R2.ai可自行修改或终止。本条规定对这些特性或工具全部有效。</p>
            <p>8.2 第三方行为免责。  您知晓并同意R2.ai方不对第三方包括外部站点的经营者使用网站或服务的行为负责，且您同意不主动要求R2.ai对此负责，第三方引起的损害风险由您自行承担。</p>
            <p>9   责任限制</p>
            <p>9.1 损失免责。  您理解并同意，R2.ai任何时候都不对以下损失负责：任何利润、收益或数据的损失，间接、附随、特殊或后果性的损害，生产力损失或使用的损失引起的损害或费用，生产经营中断，无论R2.ai是否已经对损害可能性给予提示，该等损失由本协议或与 R2.ai所有物的其他用户进行交流、互动或会议引起或与之相关，无论基于保证，版权、合同、侵权（包括过失）、产品责任或任何其他法律责任。前述对责任的限制不应适用于R2.ai的下列责任：(1) R2.ai方过失导致死亡或人身伤害，或(2) 任何R2.ai方欺诈或欺骗性虚假陈述导致的伤害。</p>
            <p>9.2责任上限。  无论在任何情况下，对于您使用R2.ai所有物包括但不限于您参与任何调查导致的损失，R2.ai方的责任不超过50美金。</p>
            <p>9.3 用户内容。 除根据R2.ai  隐私政策保护您的个人数据的义务之外，R2.ai不对存储内容、用户交流或个人设置（包括您公开内容，调查内容和用户内容）的及时性、删除、错误送达或未保存承担责任。                                                                                                                                                                                                                                                                                                                   </p>
            <p>9.4  交易基础。  前述条款规定的损害赔偿限制是R2.ai和您之间交易基础的基本因素。</p>
            <p>10    救济</p>
            <p>10.1 违约。如果R2.ai单方面认为您违反了协议的部分约定或对R2.ai所有物进行了不适当行为，R2.ai保留以下权利，删除您或您代理人在R2.ai所有物上内容或停止您在R2.ai所有物包括任何服务或任何R2.ai社区的注册。</p>
            <p>11  期限和终止</p>
            <p>11.1期限。  除非根据本协议提前终止，本协议自您接受之日（如前文所述）起生效并在您使用R2.ai所有物时持续有效。</p>
            <p>11.2在先使用。 尽管有前述规定，如您使用R2.ai所有物的日期早于您接受本协议的日期，您在此承认并同意协议开始于您首次使用R2.ai所有物之日（以较早日期为准）并将在您使用R2.ai所有物时持续有效，除非根据本协议提前终止。</p>
            <p>11.3 R2.ai服务终止。   R2.ai有权在不通知的情况下立即暂停或终止您访问R2.ai所有物。而且，如果您从实质上违反本协议的约定，或 R2.ai被法律要求进行前述处理（例如，关于网站、软件、应用或服务的规定违法），R2.ai有权在不通知的情况下立即暂停或终止您访问任何或所有R2.ai所有物。您同意所有终止事由应由R2.ai自行决定并且R2.ai不应就您的账户终止对您或任何三方负责。</p>
            <p>11.4 终止生效。 任何服务的终止包括取消对这类服务的访问和禁止进一步使用该服务。终止所有服务也包括删除您的密码和内容。在终止任何服务时，您使用这类服务的权利被立即自动终止。您知晓任何服务的终止可能涉及从我们的实时数据库中删除您的内容。本协议的所有规定根据其性质应当存续的应在服务终止时继续存续，包括但不限于所有权规定、保证的免除和责任限制。</p>
            <p>12.General Provisions.</p>
            <p>12.1 电子沟通。您和R2.ai通过电子方式沟通，无论是您访问R2.ai所有物或向R2.ai发送电子邮件，或无论R2.ai在R2.ai所有物上发通知或以电子邮件和您沟通。出于合同目的，您(1)同意接受来自R2.ai的任何电子形式的沟通；且(2)同意所有本协议和条件，协议，通知，披露和其他R2.ai向您提供的电子形式的沟通，满足任何如果该等沟通以书面形式做出则可以满足的任何法律要求。前述不影响您的法定权利。</p>
            <p>12.2 转让。本协议，以及您在本协议项下的权利义务，未经R2.ai事先书面同意，不可以转让，分包，转移或让与，或认为违反前述约定而试图进行的转让、分包、转移或让与均无效。 </p>
            <p>12.3 不可抗力。R2.ai不对任何R2.ai合理控制之外的原因导致的延迟或未能履行承担责任，包括但不限于天灾、战争、恐怖袭击、暴乱、禁运、民事或军事当局的行动、火灾、洪水、意外事故、罢工、运输工具、燃料、能源、劳动力或原材料短缺。</p>
            <p>12.4 问题、投诉、索赔。如果您对R2.ai所有物有任何问题、投诉或索赔，请联系我们：R2.ai公司，收件人：问题、投诉和索赔，contact@r2.ai。我们将尽力解决您的问题。如果您觉得您的问题未能被完全解决，我们请您让我们知晓以便进一步调查。</p>
            <p>12.5 排他管辖。您和R2.ai同意所有本协议导致的或于此相关的索赔和争议将完全在加利福尼亚的州和联邦法院诉讼。</p>
            <p>12.6 管辖法律。本协议和任何与此相关的行为将受加利福尼亚州法的管辖和解决，任何导致适用其他法域法律的条款均不生效。联合国货物买卖公约不适用于本协议。</p>
            <p>12.7 通知。当R2.ai要求您提供电子邮箱地址，您应负责提供您最近的邮箱地址。如果您提供的最近邮箱地址无效，或因任何原因导致不能向您发送本协议要求或允许的任何通知，R2.ai发送含有该通知的邮件，将视为有效通知。您可以通过如下地址向R2.ai给予通知：contact@r2.ai。该等通知应在R2.ai在前述地址收到由全国认可的隔夜快递服务或邮资预付的一级信件视为送达。</p>
            <p>12.8 弃权。对某一事件的任何弃权或怠于执行任何本协议条款不构成对于任何其他条款或在其他事件中本条款的弃权。</p>
            <p>12.9 可分割性。如果本协议任何部分被认定无效或不可执行，则该部分应被以与各方初始意图尽可能相近的方式解释，剩余部分继续完全有效。</p>
            <p>12.10 出口管制。您不可使用、出口、进口或让与R2.ai所有物，除非经美国法律，您取得R2.ai所有物的法域，以及所有其他适用法律的授权。特别是，且不限于，R2.ai所有物不能出口或再出口至(a) 任何美国禁运的国家，或(b) 任何美国财政部特别指定国家清单或美国商务部拒绝个人或企业清单中的任何个体。通过使用R2.ai所有物，您陈述和保证(1) 您不在任何受美国政府禁运约束的国家，或被美国政府指定为“支持恐怖主义”的国家，且(2) 您未被列入任何国美政府禁止或限制主体的清单。您将不会将R2.ai所有物用于任何美国法律禁止的目的，包括开发、设计、生产或制造导弹、核武器、化学武器或生物武器。您知晓并同意，R2.ai提供的产品、服务或技术受美国出口管制法律法规的约束。您应遵守这些法律法规，并不应，未经美国政府事先授权，直接或间接，在违反该等法律法规的情况下，向任何国家出口、再出口或转让R2.ai产品、服务或技术。</p>
            <p>12.11 从iTnues访问和下载应用。下列条款适用于通过苹果应用商店访问或下载的苹果应用商店来源应用</p>
            <p>(a) 您知晓并同意(1) 本协议仅约束您和R2.ai，而非苹果，且(2) R2.ai，而非苹果，对苹果应用商店来源应用及其内容负责。您使用苹果应用商店来源应用必须遵守应用商店服务协议。</p>
            <p>(b) 您知晓苹果无任何义务为苹果应用商店来源应用提供任何维护和支持服务。</p>
            <p>(c ) 任何苹果应用商店来源应用未能符合任何适用的保证，您可通知苹果，苹果将法律允许的最大范围内，退还您购买苹果应用商店来源应用的价款，苹果对苹果应用商店来源应用无其他任何保证义务。R2.ai和苹果之间，任何归因于未能符合任何保证的其他索赔、损失、责任、损害、成本、费用将是R2.ai单方的责任。</p>
            <p>(d) 您和R2.ai知晓，在R2.ai和苹果之间，苹果不负责处理任何您的或第三方的，与苹果应用商店来源应用相关的或您持有和使用苹果应用商店来源应用相关的索赔，包括但不限于(1) 产品责任索赔；(2) 任何苹果应用商店来源应用未能符合适用的法律法规要求；及(3)消费者保护或类似立法项下的发生索赔。</p>
            <p>(e ) 您和R2.ai知晓任何第三方主张苹果应用商店来源应用或您持有和使用苹果应用商店来源应用侵犯第三方知识产权，在R2.ai和苹果之间，R2.ai，而不是苹果应在本协议要求的范围内，单独负责调查，抗辩，和解和解除该知识产权侵权索赔。</p>
            <p>(f) 您和R2.ai知晓并同意，苹果和苹果子公司，系本协议与您的苹果应用商店来源应用许可相关的第三方受益人，且在您接受本协议条款和条件时，苹果有权作为第三方受益人（并视为已接受该权利）执行与您苹果应用商店来源应用许可相关的本协议。</p>
            <p>(g) 不限制本协议任何其他条款，在使用苹果应用商店来源应用时，您必须遵守所有适用的第三方条款或协议</p>
            <p>12.12 完整协议。本协议时方关于本事项的最终、完整和排他的协议，取代和吸收所有之前各方关于该事项的讨论。</p>
            <p>协议完毕</p>
            <br/>
        </div>
    }

    render() {
        return <div className={styles.license}>
            <div className={styles.back} onClick={this.props.back}><Icon className={styles.icon} type="arrow-left" /></div>
            <div className={styles.checkbox}><Checkbox onChange={this.onChange} >查看中文</Checkbox></div>
            <div className={styles.licenseTitle}><span>{this.state.language==='EN'?'R2.ai End User License Agreement':'R2.ai'}</span></div>
            {this.getContent()}
        </div>
    }
}