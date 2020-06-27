// import `.scss` files
import './scss/styles.scss';

// import UserList class
import { myPlugin as defaultExport } from './lib/myPlugin';

// export default UserList class
// I used `defaultExport` to state that variable name doesn't matter
export default defaultExport;