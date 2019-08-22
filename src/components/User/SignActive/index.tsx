import React, { useContext, useEffect } from 'react';
import { MobXProviderContext, observer } from 'mobx-react';
import styles from "./styles.module.css";

interface Interface {
    location:any
}

const SignActive = observer((props:Interface)=>{
    const {userStore,routing} = useContext(MobXProviderContext);
    useEffect(()=>{
        const {location} = props;
        const {search} = location;
        const code = search.substr(1);
        if(!code) return routing.push("/");
        userStore.completeReg(code)
    },[]);
    const {reg, regErr} = userStore;
    return <div className={styles.signActive}>
        <span>{reg?(regErr?'激活失败,请重新注册':'激活成功, 2秒后跳转'):'正在激活'}</span>
    </div>
});
export default SignActive;
