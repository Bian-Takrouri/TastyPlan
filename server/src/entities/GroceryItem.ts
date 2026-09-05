import { Entity,PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,Index,Unique} from "typeorm";
import { User } from "./User.js";

@Entity("grocery_items")
@Unique(["userId", "name"])
export class GroceryItem {

    @PrimaryGeneratedColumn()
    id!: number;

    @Index("idx_grocery_user")

    @Column({ name: "user_id",  type: "int" })
    userId!: number;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column ({type:"int" , default :1})
    quantity!: number;
    
    @Column ({ type : "boolean" , default :false})
    completed! : boolean ;
    
    @Column({ type: "boolean", default: false })
    custom!: boolean;

    @ManyToOne(() => User , (user) => user.groceryItems,{onDelete: "CASCADE"})

    @JoinColumn({ name: "user_id" })
    user!: User;
    
}